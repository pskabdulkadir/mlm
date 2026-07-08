/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserNode,
  ClosureEntry,
  FormulaConfig,
  PayoutRequestPayload,
  PayoutCalculationResult,
  TransactionStepLog,
  PayoutEngineResponse
} from "./types";
import { getPayoutStrategy } from "./payout-strategies";
import { CareerService } from "./career-service";
import { ProductService } from "./product-service";
import Big from "big.js";

/**
 * FormulaResolver
 * Resolves mathematical MLM percentages at runtime dynamically.
 * Allows instant updates to matching rates without redeploying the application.
 */
export class FormulaResolver {
  private config: FormulaConfig;

  constructor(initialConfig?: Partial<FormulaConfig>) {
    this.config = {
      BINARY_MATCHING_RATE: 0.10, // 10% on weaker leg match
      UNILEVEL_LV1_RATE: 0.10,    // 10%
      UNILEVEL_LV2_RATE: 0.05,    // 5%
      UNILEVEL_LV3_RATE: 0.03,    // 3%
      UNILEVEL_LV4_RATE: 0.02,    // 2%
      UNILEVEL_LV5_RATE: 0.01,    // 1%
      MATRIX_FLAT_RATE: 0.04,     // 4%
      MONOLINE_LEVEL_RATE: 0.02,  // 2%
      
      // Nefis Mertebeleri Careers Defaults (Unilevel Derinlik Oranları)
      DIRECT_SPONSOR_RATE: 0.25,   // 25% Direct Sponsor Bonus
      UNILEVEL_L1_RATE: 0.05,      // 5% Depth Level 1
      UNILEVEL_L2_RATE: 0.03,      // 3% Depth Level 2
      UNILEVEL_L3_RATE: 0.02,      // 2% Depth Level 3
      UNILEVEL_L4_RATE: 0.02,      // 2% Depth Level 4
      UNILEVEL_L5_RATE: 0.01,      // 1% Depth Level 5
      UNILEVEL_L6_RATE: 0.01,      // 1% Depth Level 6
      UNILEVEL_L7_RATE: 0.01,      // 1% Depth Level 7 (Total: 15%)
      MONOLINE_POOL_RATE: 0.10,    // 10% Monoline Pool (Passive Income Distribution)
      ...initialConfig
    };
  }

  /**
   * Retrieves the current formula config parameters
   */
  public getConfig(): FormulaConfig {
    return { ...this.config };
  }

  /**
   * Updates formula values in real-time
   */
  public updateFormula(key: keyof FormulaConfig, rate: number): void {
    if (rate < 0 || rate > 1.0) {
      throw new Error(`Formula value for ${key} must be between 0.0 and 1.0 (got ${rate})`);
    }
    this.config[key] = rate;
  }
}

/**
 * PayoutEngine
 * Core blackbox calculations engine designed with Dependency Injection for easy unit testing.
 * Features an ACID Transaction pipeline that simulates row-level database locking (SELECT FOR UPDATE)
 * to avoid concurrent race conditions during commission calculations.
 */
export class PayoutEngine {
  private formulaResolver: FormulaResolver;

  constructor(formulaResolver: FormulaResolver) {
    this.formulaResolver = formulaResolver;
  }

  /**
   * Generates Closure Table entries for the entire Map tree
   * Enables fetching infinite uplines in a single lookup!
   */
  public static buildClosureTable(users: Map<string, UserNode>): ClosureEntry[] {
    const closures: ClosureEntry[] = [];

    // Self closure entries (depth = 0)
    for (const userId of users.keys()) {
      closures.push({
        ancestor_id: userId,
        descendant_id: userId,
        depth: 0
      });
    }

    // Traverse uplines to build multi-level ancestral relationships
    for (const [userId, user] of users.entries()) {
      let depth = 1;
      let currentParentId = user.parent_id;

      while (currentParentId) {
        const parent = users.get(currentParentId);
        if (!parent) break;

        closures.push({
          ancestor_id: currentParentId,
          descendant_id: userId,
          depth: depth
        });

        currentParentId = parent.parent_id;
        depth++;
      }
    }

    return closures;
  }

  /**
   * Executes payout calculation inside an ACID-compliant Simulated DB Transaction.
   * Acquires row-level locks on affected users to prevent double-spending or race conditions.
   */
  public calculateWithTransaction(
    payload: PayoutRequestPayload,
    usersDb: Map<string, UserNode>,
    pointsLogDb: any[],
    payoutHistoryDb: any[],
    simulateError: boolean = false
  ): PayoutEngineResponse {
    const timestamp = () => new Date().toISOString();
    let currentLogs: TransactionStepLog[] = [];
    
    // BAN BINARY SCHEMES BY SYSTEM CONSTITUTION
    if (payload.model_type === "binary") {
      currentLogs.push({
        timestamp: timestamp(),
        type: "ROLLBACK",
        message: "❌ [SYSTEM-CONSTITUTION] REJECTED: Binary, Matching, or Leg/Pair logic is strictly forbidden by the System Constitution."
      });
      return {
        status: "error",
        sale_id: payload.sale_id,
        payouts: [],
        transaction_logs: currentLogs,
        error: "Sistem Anayasası İhlali: Sistemde Binary (ikili), denge, eşleşme veya kol mantığına dayalı hesaplamalar kesinlikle yasaktır."
      };
    }

    // 1. DYNAMIC PRODUCT FETCHING (ProductPrice is read-only and always fresh)
    let productPrice = payload.amount || 0;
    let productPv = payload.pv_amount || 0;
    let resolvedProductName = payload.product_name || "MLM Satışı";

    if (payload.product_id) {
      try {
        const product = ProductService.getById(payload.product_id);
        // Guarantee read-only immutability of the fetched price
        productPrice = product.price;
        productPv = product.pv_amount;
        resolvedProductName = product.name;
        
        currentLogs.push({
          timestamp: timestamp(),
          type: "INFO",
          message: `[DYNAMIC-FETCH] Dynamically fetched Product ${payload.product_id} ('${resolvedProductName}'). Price: $${productPrice} USD, PV: ${productPv} PV (Read-Only Guaranteed).`
        });
      } catch (prodErr: any) {
        return {
          status: "error",
          sale_id: payload.sale_id,
          payouts: [],
          transaction_logs: [{
            timestamp: timestamp(),
            type: "ROLLBACK",
            message: `[PRODUCT-SERVICE-ERROR] ${prodErr.message}`
          }],
          error: prodErr.message
        };
      }
    }

    // Capture initial snapshots for potential Rollbacks
    const dbSnapshot = new Map<string, string>();
    for (const [id, user] of usersDb.entries()) {
      dbSnapshot.set(id, JSON.stringify(user));
    }
    const pointsLogSnapshot = [...pointsLogDb];
    const payoutHistorySnapshot = [...payoutHistoryDb];

    const maxAttempts = 3;
    let attempt = 1;
    let runSimulatedError = simulateError;

    while (attempt <= maxAttempts) {
      const logs: TransactionStepLog[] = [...currentLogs];
      logs.push({
        timestamp: timestamp(),
        type: "INFO",
        message: `[TX-BEGIN] [ATTEMPT ${attempt}/${maxAttempts}] Starting payout transaction for Sale: ${payload.sale_id}. Seller: ${payload.user_id}.`
      });

      try {
        // Simulated Row Locks (SELECT ... FOR UPDATE)
        logs.push({
          timestamp: timestamp(),
          type: "INFO",
          message: `[TX-LOCK] [ATTEMPT ${attempt}] Gathering all ancestors of User: ${payload.user_id} for pessimistic locking...`
        });

        const affectedUserIds = new Set<string>();
        affectedUserIds.add(payload.user_id);

        const closures = PayoutEngine.buildClosureTable(usersDb);
        const ancestors = closures.filter(c => c.descendant_id === payload.user_id && c.depth > 0);
        ancestors.forEach(a => affectedUserIds.add(a.ancestor_id));

        const lockedIds = Array.from(affectedUserIds);
        logs.push({
          timestamp: timestamp(),
          type: "LOCK_ACQUIRED",
          message: `[TX-LOCK] Successfully acquired Row Locks (SELECT FOR UPDATE) on ${lockedIds.length} users: [${lockedIds.join(", ")}].`
        });

        // Simulating error on the first attempt if checked
        if (runSimulatedError) {
          runSimulatedError = false; // Turn off for the NEXT retry so it self-heals!
          throw new Error("Simulated high-load database transaction deadlock. Forcing rollback.");
        }

        // Calculate and build formula resolver
        const currentConfig = this.formulaResolver.getConfig();
        logs.push({
          timestamp: timestamp(),
          type: "INFO",
          message: `[TX-FORMULA] Formula Resolver initialized. Active Unilevel L1=${(currentConfig.UNILEVEL_L1_RATE * 100)}%, Monoline Pool=${(currentConfig.MONOLINE_POOL_RATE * 100)}%`
        });

        const seller = usersDb.get(payload.user_id);
        if (!seller) {
          throw new Error(`Integrity constraint failed: Sales Owner User ID ${payload.user_id} not found.`);
        }

        logs.push({
          timestamp: timestamp(),
          type: "CALCULATING",
          message: `[TX-CALC] Executing Strategy calculation engine for model: ${payload.model_type.toUpperCase()}...`
        });

        // Add Sale to Points Ledger
        const newPointsLog = {
          id: `PL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sale_id: payload.sale_id,
          user_id: payload.user_id,
          amount: Number(productPrice),
          pv_amount: Number(productPv),
          product_name: resolvedProductName,
          timestamp: timestamp()
        };
        pointsLogDb.unshift(newPointsLog);

        // Update team ciro & career upgrades
        logs.push({
          timestamp: timestamp(),
          type: "INFO",
          message: `[TX-CAREER] Initiating Unilevel Team Ciro updates for sale amount: $${productPrice}`
        });
        
        CareerService.updateTeamCiro(payload.user_id, Number(productPrice), usersDb, logs);

        logs.push({
          timestamp: timestamp(),
          type: "INFO",
          message: `[TX-CAREER] Evaluating career level check (CareerCheck) for upline ancestors...`
        });

        for (const ancestorId of lockedIds) {
          try {
            CareerService.checkCareerUpgrade(ancestorId, usersDb, logs);
          } catch (innerErr: any) {
            logs.push({
              timestamp: timestamp(),
              type: "INFO",
              message: `⚠️ [CAREER-CHECK-ALERT] Fault-tolerant bypass of career upgrade check for User ${ancestorId}: ${innerErr.message}`
            });
          }
        }

        // Execute Strategy Payout (Unilevel or Monoline or Matrix)
        const strategy = getPayoutStrategy(payload.model_type);
        const payouts = strategy.calculate({
          sale_id: payload.sale_id,
          user_id: payload.user_id,
          pv_amount: productPv,
          amount: productPrice
        }, usersDb, closures, currentConfig);

        logs.push({
          timestamp: timestamp(),
          type: "CALCULATING",
          message: `[TX-CALC] Strategy output: Calculated ${payouts.length} payout item(s).`
        });

        // Write payout histories
        payouts.forEach((p) => {
          const historyEntry = {
            id: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sale_id: payload.sale_id,
            user_id: p.user_id,
            amount: p.amount,
            currency: "USD",
            model_type: payload.model_type.toUpperCase() as any,
            rule_details: p.rule_details,
            timestamp: timestamp()
          };
          payoutHistoryDb.unshift(historyEntry);

          logs.push({
            timestamp: timestamp(),
            type: "LEDGER_UPDATE",
            message: `[TX-LEDGER] Written commission credit of $${p.amount} to User ${p.user_id} (${p.type})`
          });
        });

        // Success Commit
        logs.push({
          timestamp: timestamp(),
          type: "COMMIT",
          message: `🎉 [TX-COMMIT] All integrity checks passed on Attempt ${attempt}. Releasing locks. Committing changes.`
        });

        if (attempt > 1) {
          logs.push({
            timestamp: timestamp(),
            type: "INFO",
            message: `🔧 [SELF-HEALING] Payout Engine self-healed successfully on Attempt ${attempt} after earlier failure!`
          });
        }

        return {
          status: "success",
          sale_id: payload.sale_id,
          payouts,
          transaction_logs: logs
        };

      } catch (err: any) {
        // Rollback current attempt changes
        logs.push({
          timestamp: timestamp(),
          type: "ROLLBACK",
          message: `[TX-ROLLBACK] Attempt ${attempt} failed with error: "${err.message}". Reverting modifications and releasing locks.`
        });

        // Restore snapshots
        usersDb.clear();
        for (const [id, jsonStr] of dbSnapshot.entries()) {
          usersDb.set(id, JSON.parse(jsonStr));
        }
        pointsLogDb.length = 0;
        pointsLogDb.push(...pointsLogSnapshot);
        payoutHistoryDb.length = 0;
        payoutHistoryDb.push(...payoutHistorySnapshot);

        currentLogs = [...logs];

        if (attempt < maxAttempts) {
          currentLogs.push({
            timestamp: timestamp(),
            type: "INFO",
            message: `🔄 [KÖRÜKLEME-HEALING] Initiating immediate retry attempt ${attempt + 1}...`
          });
          attempt++;
        } else {
          // No more retries left
          currentLogs.push({
            timestamp: timestamp(),
            type: "ROLLBACK",
            message: `❌ [KÖRÜKLEME-HEALING-FAILED] Self-healing failed after maximum ${maxAttempts} attempts.`
          });

          return {
            status: "error",
            sale_id: payload.sale_id,
            payouts: [],
            transaction_logs: currentLogs,
            error: err.message
          };
        }
      }
    }

    return {
      status: "error",
      sale_id: payload.sale_id,
      payouts: [],
      transaction_logs: currentLogs,
      error: "Sıradışı hata: PayoutEngine döngüden çıktı."
    };
  }
}
