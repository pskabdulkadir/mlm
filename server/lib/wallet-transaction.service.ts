import { WalletTransaction, User } from "./models";

export async function applyWalletTransactions(transactions: any[], session: any = null): Promise<boolean> {
  try {
    for (const txData of transactions) {
      const { userId, amount, type, reference, description, sourceUserId, status } = txData;
      
      // 1. Create and save the new WalletTransaction document
      const tx = new WalletTransaction({
        userId,
        amount,
        type: type ? type.toUpperCase() : "COMMISSION",
        reference: reference || `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        description: description || "",
        sourceUserId,
        status: status || "PAID",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if (session) {
        await tx.save({ session });
      } else {
        await tx.save();
      }

      // 2. Load and update the corresponding user's wallet
      const user = await User.findOne({ id: userId }).session(session || null);
      if (user) {
        // Safe check for wallet structure
        const wallet = user.wallet || { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 };
        
        let balanceChange = amount;
        
        // If it's a withdrawal, amount can be passed as positive, so we should subtract it from balance
        const isDeduction = [
          "WITHDRAWAL", "withdrawal",
          "fee", "FEE",
          "TRANSFER_SENT", "transfer_sent",
          "SHOPPING", "shopping",
          "PURCHASE", "purchase"
        ].includes(type);
        if (isDeduction && balanceChange > 0) {
          balanceChange = -balanceChange;
        }

        const newBalance = Math.round((wallet.balance + balanceChange) * 100) / 100;
        let newTotalEarnings = wallet.totalEarnings || 0;
        
        // Earning increment (for commissions and bonuses, i.e., positive changes not of types of balance adjustments)
        if (balanceChange > 0 && !["DEPOSIT", "deposit", "REFUND", "refund"].includes(type)) {
          newTotalEarnings = Math.round((newTotalEarnings + balanceChange) * 100) / 100;
        }

        let newSponsorBonus = wallet.sponsorBonus || 0;
        const normalizedType = (type || "").toUpperCase();
        if (normalizedType === "SPONSOR" || normalizedType === "DIRECT") {
          newSponsorBonus = Math.round((newSponsorBonus + balanceChange) * 100) / 100;
        }

        let newCareerBonus = wallet.careerBonus || 0;
        if (normalizedType === "CAREER" || normalizedType === "DEPTH") {
          newCareerBonus = Math.round((newCareerBonus + balanceChange) * 100) / 100;
        }

        user.wallet = {
          ...wallet,
          balance: newBalance,
          totalEarnings: newTotalEarnings,
          sponsorBonus: newSponsorBonus,
          careerBonus: newCareerBonus
        };

        if (session) {
          await user.save({ session });
        } else {
          await user.save();
        }

        // Real-time projection of earnings into MonthlySummary collection
        try {
          const { MonthlySummary } = await import("./models");
          const yearMonth = new Date().toISOString().slice(0, 7);
          
          let careerInc = 0;
          let poolInc = 0;

          if (["CAREER", "DEPTH", "UNILEVEL"].includes(normalizedType)) {
            careerInc = amount;
          } else if (["PASSIVE", "POOL"].includes(normalizedType)) {
            poolInc = amount;
          }

          if (careerInc > 0 || poolInc > 0) {
            await MonthlySummary.updateOne(
              { userId, yearMonth },
              {
                $inc: {
                  careerEarnings: careerInc,
                  poolEarnings: poolInc
                },
                $setOnInsert: {
                  personalSalesVolume: 0,
                  isEligibleForPoolsAndBonuses: false,
                  status: "NONE"
                },
                $set: { updatedAt: new Date() }
              },
              { upsert: true, session: session || null }
            );
          }
        } catch (sumErr) {
          console.error("Error updating MonthlySummary projection:", sumErr);
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Error in applyWalletTransactions:", error);
    return false;
  }
}
