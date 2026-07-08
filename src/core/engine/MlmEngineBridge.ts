import { UserNode, ClosureEntry, PayoutRequestPayload, PayoutEngineResponse } from "./types";
import { PayoutEngine, FormulaResolver } from "./payout-engine";
import { User } from "../../../server/lib/models";
import { applyWalletTransactions } from "../../../server/lib/wallet-transaction.service";

export class MlmEngineBridge {
  /**
   * Convert a MongoDB Mongoose User document to the engine's stateless UserNode format.
   */
  public static toUserNode(mongoUser: any): UserNode {
    return {
      id: mongoUser.id || mongoUser._id?.toString(),
      name: mongoUser.fullName || "Isimsiz Üye",
      username: mongoUser.email?.split("@")[0] || "member",
      email: mongoUser.email || "",
      parent_id: mongoUser.sponsorId || null,
      upline_id: mongoUser.sponsorId || null,
      joined_at: mongoUser.registrationDate ? new Date(mongoUser.registrationDate).toISOString() : new Date().toISOString(),
      personal_pv: mongoUser.pointsSystem?.personalSalesPoints || 0,
      career_level: mongoUser.career_level || (mongoUser.careerLevel && typeof mongoUser.careerLevel === "object" ? mongoUser.careerLevel.order || mongoUser.careerLevel.level : 1) || 1,
      direct_references: mongoUser.direct_references || mongoUser.directReferrals || 0,
      total_team_ciro: mongoUser.total_team_ciro || mongoUser.teamTurnoverUSD || 0,
    };
  }

  /**
   * Calculate and apply payouts using the PayoutEngine, updating Mongoose database atomically.
   */
  public static async calculateAndApplyPayout(payload: {
    saleId: string;
    buyerUserId: string;
    amount: number;
    modelType: "unilevel" | "matrix" | "monoline";
    productName?: string;
  }): Promise<PayoutEngineResponse> {
    console.log(`[MLM-BRIDGE] Running payout calculation for Sale: ${payload.saleId}, Buyer: ${payload.buyerUserId}`);

    // 1. Fetch all users from Mongoose to build the tree in memory
    const mongoUsers = await User.find({});
    const usersMap = new Map<string, UserNode>();
    const idToMongoUserMap = new Map<string, any>();

    for (const u of mongoUsers) {
      const node = this.toUserNode(u);
      usersMap.set(node.id, node);
      idToMongoUserMap.set(node.id, u);
    }

    // 2. Initialize PayoutEngine
    const formulaResolver = new FormulaResolver();
    const engine = new PayoutEngine(formulaResolver);

    // 3. Setup Payload for PayoutEngine
    const requestPayload: PayoutRequestPayload = {
      sale_id: payload.saleId,
      user_id: payload.buyerUserId,
      amount: payload.amount,
      pv_amount: payload.amount, // 1 USD = 1 PV
      model_type: payload.modelType,
      product_name: payload.productName || "MLM Satışı",
      apiKey: process.env.GEMINI_API_KEY || "dummy",
    };

    // 4. Run calculations
    const pointsLogDb: any[] = [];
    const payoutHistoryDb: any[] = [];
    const response = engine.calculateWithTransaction(
      requestPayload,
      usersMap,
      pointsLogDb,
      payoutHistoryDb
    );

    if (response.status === "error") {
      console.error("[MLM-BRIDGE] Payout calculation failed with error:", response.error);
      return response;
    }

    // 5. Apply the payouts to Mongoose wallet transactions and balances
    const transactionsToApply: any[] = [];

    for (const payout of response.payouts) {
      const recipientMongo = idToMongoUserMap.get(payout.user_id);
      if (!recipientMongo) continue;

      // Add payout transaction
      transactionsToApply.push({
        userId: payout.user_id,
        amount: payout.amount,
        type: payload.modelType.toUpperCase(),
        reference: `PAYOUT-${payload.saleId}-${payout.user_id}-${Date.now()}`,
        description: payout.rule_details,
        sourceUserId: payload.buyerUserId,
        status: "PAID"
      });
    }

    if (transactionsToApply.length > 0) {
      await applyWalletTransactions(transactionsToApply);
    }

    // 6. Save updated team_ciro and career_level back to Mongoose database
    for (const [id, node] of usersMap.entries()) {
      const u = idToMongoUserMap.get(id);
      if (!u) continue;

      let hasChanges = false;

      if (u.total_team_ciro !== node.total_team_ciro) {
        u.total_team_ciro = node.total_team_ciro;
        u.teamTurnoverUSD = node.total_team_ciro;
        hasChanges = true;
      }

      if (u.career_level !== node.career_level) {
        u.career_level = node.career_level;
        // Also update nested careerLevel schema
        if (u.careerLevel && typeof u.careerLevel === "object") {
          u.careerLevel.order = node.career_level;
          u.careerLevel.level = node.career_level;
          const { CAREER_LEVELS_CONFIG } = await import("../../../shared/mlmRules");
          const config = CAREER_LEVELS_CONFIG.find(c => c.order === node.career_level);
          if (config) {
            u.careerLevel.name = config.name;
            u.careerLevel.displayName = config.displayName;
          }
        }
        hasChanges = true;
      }

      if (hasChanges) {
        await u.save();
      }
    }

    console.log(`[MLM-BRIDGE] Payout successfully applied. Generated ${response.payouts.length} transactions.`);
    return response;
  }
}
export default MlmEngineBridge;
