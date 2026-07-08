import { WalletTransaction, User } from "../models";

export class WalletTransactionService {
  /**
   * Get total sum of HELD balance for a user
   */
  static async getHeldBalance(userId: string): Promise<number> {
    try {
      const heldTx = await WalletTransaction.find({
        userId,
        status: "HELD"
      });
      const total = heldTx.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
      return Math.round(total * 100) / 100;
    } catch (error) {
      console.error("Error in getHeldBalance:", error);
      return 0;
    }
  }

  /**
   * Release all HELD transactions for a user to PAID status and update wallet balance
   */
  static async releaseHeldTransactions(userId: string): Promise<{ releasedCount: number; releasedAmount: number }> {
    try {
      const heldTx = await WalletTransaction.find({
        userId,
        status: "HELD"
      });

      if (heldTx.length === 0) {
        return { releasedCount: 0, releasedAmount: 0 };
      }

      const totalAmount = heldTx.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

      // Update transactions to PAID
      await WalletTransaction.updateMany(
        { userId, status: "HELD" },
        { $set: { status: "PAID", updatedAt: new Date(), monthlyResetReleasedAt: new Date() } }
      );

      // Update user wallet balance
      const user = await User.findOne({ id: userId });
      if (user) {
        const wallet = user.wallet || { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 };
        const newBalance = Math.round((wallet.balance + totalAmount) * 100) / 100;
        const newTotalEarnings = Math.round(((wallet.totalEarnings || 0) + totalAmount) * 100) / 100;

        user.wallet = {
          ...wallet,
          balance: newBalance,
          totalEarnings: newTotalEarnings
        };
        await user.save();
      }

      return {
        releasedCount: heldTx.length,
        releasedAmount: Math.round(totalAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      };
    } catch (error) {
      console.error("Error in releaseHeldTransactions:", error);
      return { releasedCount: 0, releasedAmount: 0 };
    }
  }
}
