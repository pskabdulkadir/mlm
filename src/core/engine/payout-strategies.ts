/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Big from "big.js";
import { PayoutStrategy, PayoutCalculationResult, UserNode, ClosureEntry, FormulaConfig } from "./types";
import { CAREER_LEVELS } from "./config/career-config";

// Helper to get ancestor depth limit based on career
function getAncestorDepthLimit(user: UserNode): number {
  const level = user.career_level || 1;
  const config = CAREER_LEVELS[level - 1];
  return config ? config.monolineDepthLimit : 10;
}

// 1. BINARY STRATEGY - DISABLED AND SIGNED AS DEAD CODE BY SYSTEM CONSTITUTION
export class BinaryStrategy implements PayoutStrategy {
  calculate(
    payload: { sale_id: string; user_id: string; pv_amount: number; amount: number },
    users: Map<string, UserNode>,
    closures: ClosureEntry[],
    config: FormulaConfig
  ): PayoutCalculationResult[] {
    // DEAD CODE BY SYSTEM CONSTITUTION - BINARY/MATCHING/LEG/PAIR CALCULATION IS STRICTLY FORBIDDEN
    throw new Error("Sistem Anayasası İhlali: Sistemde Binary (ikili), denge, eşleşme veya kol mantığına dayalı hesaplamalar kesinlikle yasaktır ve engellenmiştir.");
  }
}

// 2. UNILEVEL STRATEGY (Harnesses Closure Table)
export class UnilevelStrategy implements PayoutStrategy {
  calculate(
    payload: { sale_id: string; user_id: string; pv_amount: number; amount: number },
    users: Map<string, UserNode>,
    closures: ClosureEntry[],
    config: FormulaConfig
  ): PayoutCalculationResult[] {
    const payouts: PayoutCalculationResult[] = [];
    const { user_id } = payload;
    const price = payload.amount || payload.pv_amount || 0;
    
    if (price <= 0) return payouts;

    // Commission Rates for Unilevel (7 levels)
    const commissionRates = [
      config.UNILEVEL_L1_RATE !== undefined ? config.UNILEVEL_L1_RATE : 0.05,
      config.UNILEVEL_L2_RATE !== undefined ? config.UNILEVEL_L2_RATE : 0.03,
      config.UNILEVEL_L3_RATE !== undefined ? config.UNILEVEL_L3_RATE : 0.02,
      config.UNILEVEL_L4_RATE !== undefined ? config.UNILEVEL_L4_RATE : 0.02,
      config.UNILEVEL_L5_RATE !== undefined ? config.UNILEVEL_L5_RATE : 0.01,
      config.UNILEVEL_L6_RATE !== undefined ? config.UNILEVEL_L6_RATE : 0.01,
      config.UNILEVEL_L7_RATE !== undefined ? config.UNILEVEL_L7_RATE : 0.01,
    ];

    // Get all sponsor ancestors chronologically
    const uplineClosures = closures
      .filter((c) => c.descendant_id === user_id && c.depth > 0)
      .sort((a, b) => a.depth - b.depth);

    let maxRateSeen = 0; // tracking differential rate up the tree

    for (const entry of uplineClosures) {
      const level = entry.depth;
      const uplineUser = users.get(entry.ancestor_id);
      if (!currentNodeIsValid(uplineUser)) continue;

      // Depth limiting filter based on career limit
      const depthLimit = getAncestorDepthLimit(uplineUser);
      if (depthLimit !== Infinity && level > depthLimit) {
        continue;
      }

      // 1. Direct Sponsor Bonus (25%)
      if (level === 1) {
        const dsRate = config.DIRECT_SPONSOR_RATE !== undefined ? config.DIRECT_SPONSOR_RATE : 0.25;
        if (dsRate > 0) {
          const dsAmount = new Big(price).times(dsRate);
          payouts.push({
            user_id: entry.ancestor_id,
            amount: parseFloat(dsAmount.toFixed(2)),
            type: "direct_sponsor_bonus",
            rule_details: `Direct Sponsor Bonus: ${(dsRate * 100).toFixed(1)}% of $${price} sale from sponsored affiliate ${user_id}.`
          });
        }
      }

      // 2. Unilevel Levels Bonus (L1 to L7)
      if (level <= commissionRates.length) {
        const rate = commissionRates[level - 1];
        if (rate > 0) {
          const payoutAmount = new Big(price).times(rate);
          payouts.push({
            user_id: entry.ancestor_id,
            amount: parseFloat(payoutAmount.toFixed(2)),
            type: `unilevel_level_${level}`,
            rule_details: `Unilevel Level ${level} Bonus: ${(rate * 100).toFixed(2)}% of $${price} sale from downline affiliate ${user_id} (Resolved via Closure Table).`
          });
        }
      }

      // 3. Monoline Career Differential Bonus (Kariyer Farkı Primi)
      const poolRate = config.MONOLINE_POOL_RATE !== undefined ? config.MONOLINE_POOL_RATE : 0.05;
      const careerLevel = uplineUser.career_level || 1;
      const careerRate = (careerLevel) * (poolRate / 10); // Level 1 is 0.1 * 10% = 1%, Level 10 is 1.0 * 10% = 10%

      if (careerRate > maxRateSeen) {
        const diffRate = careerRate - maxRateSeen;
        const diffAmount = new Big(price).times(diffRate);
        if (diffAmount.gt(0)) {
          const careerName = CAREER_LEVELS[careerLevel - 1]?.name || `Level ${careerLevel}`;
          payouts.push({
            user_id: entry.ancestor_id,
            amount: parseFloat(diffAmount.toFixed(2)),
            type: `career_difference_bonus`,
            rule_details: `Monoline Career Differential Bonus: Earned ${careerName} difference rate of ${(diffRate * 100).toFixed(2)}% (Career rate: ${(careerRate * 100).toFixed(1)}% - Max seen: ${(maxRateSeen * 100).toFixed(1)}%) of $${price} sale (Monoline pool portion).`
          });
        }
        maxRateSeen = careerRate;
      }
    }

    return payouts;
  }
}

// 3. MATRIX STRATEGY (Harnesses Closure Table)
export class MatrixStrategy implements PayoutStrategy {
  calculate(
    payload: { sale_id: string; user_id: string; pv_amount: number; amount: number },
    users: Map<string, UserNode>,
    closures: ClosureEntry[],
    config: FormulaConfig
  ): PayoutCalculationResult[] {
    const payouts: PayoutCalculationResult[] = [];
    const { user_id, pv_amount } = payload;
    
    if (pv_amount <= 0) return payouts;

    // Matrix pays a flat percentage configured dynamically up to 5 levels
    const matrixDepth = 5;
    const matrixRate = config.MATRIX_FLAT_RATE; // Dynamic formula resolver rate
    
    if (matrixRate <= 0) return payouts;

    // Single select equivalent using our Closure Table structure to fetch ancestors
    const uplineClosures = closures
      .filter((c) => c.descendant_id === user_id && c.depth > 0 && c.depth <= matrixDepth)
      .sort((a, b) => a.depth - b.depth);

    for (const entry of uplineClosures) {
      const depth = entry.depth;
      const parentUser = users.get(entry.ancestor_id);
      if (!currentNodeIsValid(parentUser)) continue;
      
      const payoutAmount = new Big(pv_amount).times(matrixRate);
      
      payouts.push({
        user_id: entry.ancestor_id,
        amount: parseFloat(payoutAmount.toFixed(2)),
        type: `matrix_depth_${depth}`,
        rule_details: `Matrix Depth ${depth} Bonus: ${(matrixRate * 100).toFixed(1)}% of ${pv_amount} PV from matrix downline cell ${user_id} (Resolved via Closure Table).`
      });
    }
    
    return payouts;
  }
}

// 4. MONOLINE STRATEGY
export class MonolineStrategy implements PayoutStrategy {
  calculate(
    payload: { sale_id: string; user_id: string; pv_amount: number; amount: number },
    users: Map<string, UserNode>,
    closures: ClosureEntry[],
    config: FormulaConfig
  ): PayoutCalculationResult[] {
    const payouts: PayoutCalculationResult[] = [];
    const { user_id } = payload;
    const price = payload.amount || payload.pv_amount || 0;
    
    if (price <= 0) return payouts;

    // Monoline pays preceding users (joined chronologically before the seller)
    const sortedUsers = Array.from(users.values())
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
      
    const sellerIndex = sortedUsers.findIndex(u => u.id === user_id);
    if (sellerIndex === -1) return payouts;

    const poolRate = config.MONOLINE_POOL_RATE !== undefined ? config.MONOLINE_POOL_RATE : 0.05;
    if (poolRate <= 0) return payouts;

    let maxRateSeen = 0; // track the differential tier reached so far in the line

    // Distribute among chronologically preceding users
    for (let i = sellerIndex - 1; i >= 0; i--) {
      const u = sortedUsers[i];
      if (!currentNodeIsValid(u)) continue;

      const distance = sellerIndex - i; // chronological distance in the monoline

      // Enforce career-based monoline depth limit check
      const depthLimit = getAncestorDepthLimit(u);
      if (depthLimit !== Infinity && distance > depthLimit) {
        continue;
      }

      // Calculate career rate for this user (each level represents 1/10th of the pool, e.g. L10: 5%)
      const careerLevel = u.career_level || 1;
      const careerRate = (careerLevel) * (poolRate / 10);

      // Apply Career Difference Bonus (Kariyer Farkı Primi)
      if (careerRate > maxRateSeen) {
        const diffRate = careerRate - maxRateSeen;
        const diffAmount = new Big(price).times(diffRate);
        
        if (diffAmount.gt(0)) {
          const careerName = CAREER_LEVELS[careerLevel - 1]?.name || `Level ${careerLevel}`;
          payouts.push({
            user_id: u.id,
            amount: parseFloat(diffAmount.toFixed(2)),
            type: `monoline_career_pool_level_${careerLevel}`,
            rule_details: `Monoline Career Pool: Earned ${careerName} difference rate of ${(diffRate * 100).toFixed(2)}% (Career rate: ${(careerRate * 100).toFixed(1)}% - Max seen: ${(maxRateSeen * 100).toFixed(1)}%) of $${price} sale from trailing user ${user_id} at distance ${distance}.`
          });
        }
        
        maxRateSeen = careerRate;

        // If the entire pool (e.g. 5%) is fully absorbed, we can stop traversing!
        if (maxRateSeen >= poolRate) {
          break;
        }
      }
    }

    return payouts;
  }
}

function currentNodeIsValid(node: UserNode | undefined): node is UserNode {
  return node !== undefined;
}

// Factory to resolve strategy
export function getPayoutStrategy(modelType: "binary" | "unilevel" | "matrix" | "monoline"): PayoutStrategy {
  switch (modelType) {
    case "binary":
      return new BinaryStrategy();
    case "unilevel":
      return new UnilevelStrategy();
    case "matrix":
      return new MatrixStrategy();
    case "monoline":
      return new MonolineStrategy();
    default:
      throw new Error(`Unsupported model type: ${modelType}`);
  }
}
