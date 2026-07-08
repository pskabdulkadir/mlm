import { mongoDb } from "./mongo-database";
import MonolineCommissionService from "./monoline-commission-service";
import { applyWalletTransactions } from "./wallet-transaction.service";
import LoggerService, { LogContext } from "./logger";

export async function fulfillProductPurchase(params: {
  productId: string;
  buyerEmail: string;
  referralCode?: string;
  shippingAddress: any;
  paymentMethod: string;
  totalAmount?: number;
  userId?: string;
  purchaseId?: string;
}) {
  const { productId, buyerEmail, referralCode, shippingAddress, paymentMethod, totalAmount, userId, purchaseId } = params;

  try {
    // 1. Get product details
    const product = (await mongoDb.getProductById(productId)) as any;
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // 2. Resolve buyer ID if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const user = await mongoDb.getUserByEmail(buyerEmail);
      finalUserId = user?.id;
    }

    // 3. Resolve or Create purchase record
    let resultPurchase: any = null;
    if (purchaseId) {
      resultPurchase = await mongoDb.getProductPurchaseById(purchaseId);
      if (!resultPurchase) {
        throw new Error(`Purchase record not found: ${purchaseId}`);
      }
    } else {
      const purchaseResult = (await mongoDb.createProductPurchase({
        userId: finalUserId || "anonymous",
        productId,
        totalAmount: totalAmount || (product as any).price,
        referralCode,
        buyerEmail,
        paymentMethod,
        shippingAddress,
        status: "approved"
      } as any)) as any;

      if (!purchaseResult.success || !purchaseResult.purchase) {
        throw new Error(`Failed to create purchase record: ${purchaseResult.error || "unknown"}`);
      }
      resultPurchase = purchaseResult.purchase;
    }

    // 4. Distribute commissions
    const purchaseAmount = Math.max(totalAmount || (product as any).price, 0.01); // guard: always > 0
    const allUsers = await mongoDb.getAllUsers();

    LoggerService.info(`💰 Processing Commissions for Fulfill: ${(product as any).name}`, { 
      context: LogContext.COMMISSION,
      productId,
      buyerEmail
    });

    const commissionResult = await MonolineCommissionService.calculateMonolineCommissions(
      finalUserId || 'anonymous',
      purchaseAmount,
      allUsers as any
    );

    // Apply transactions
    if (commissionResult.transactions.length > 0) {
      const walletTxs = (commissionResult.transactions as any[]).map((t: any) => ({
        userId: t.userId,
        amount: t.amount,
        type: t.type === 'direct' ? 'SPONSOR' : 'CAREER',
        reference: t.reference || `COMM-${Date.now()}-${t.userId}`,
        description: t.description || `Ürün komisyonu: ${(product as any).name}`
      }));

      await applyWalletTransactions(walletTxs as any);

      // Log to database for reporting and panel views
      await mongoDb.createMonolineCommissionTransactions(commissionResult.transactions);
    }

    // Add to system pools
    await MonolineCommissionService.addToSystemPools(
      commissionResult.passivePoolAmount,
      commissionResult.companyFundAmount,
      `PURCHASE-${resultPurchase.id || Date.now()}`
    );

    // 5. Update Active Membership Status (Aktiflik)
    // NOTE: Career update is already done in createProductPurchase()
    // This section only handles membership duration (yearly/monthly/etc.)
    if (finalUserId) {
      try {
        // Activity status logic (Aktiflik)
        const userObj = await mongoDb.getUserById(finalUserId);
        if (userObj) {
          const previousPurchases = await mongoDb.getUserProductPurchases(finalUserId);
          const currentPurchaseId = resultPurchase.id;
          const previousP = previousPurchases.filter((p: any) => p.id !== currentPurchaseId);
          const isFirstPurchase = previousP.length === 0;

          const isYearly = purchaseAmount >= 200 || 
                           ((product as any).name && /yıllık|yillik|yearly/i.test((product as any).name));
          const isMonthly = purchaseAmount >= 20 || 
                            ((product as any).name && /aylık|aylik|monthly|üyelik|uyelik|paket|package/i.test((product as any).name));

          let activeMonths = 0;
          if (isYearly) {
            activeMonths = 12;
          } else if (isMonthly) {
            activeMonths = 1;
          }
          // Removed: "First purchase of any other product provides 1 month active status"
          // Active status is ONLY granted for membership packages (min $20)

          if (activeMonths > 0) {
            const now = new Date();
            let baseDate = now;

            // If user has a valid active membership in the future, extend it
            if (userObj.membershipEndDate && new Date(userObj.membershipEndDate) > now) {
              baseDate = new Date(userObj.membershipEndDate);
            }

            const newEndDate = new Date(baseDate);
            newEndDate.setMonth(newEndDate.getMonth() + activeMonths);

            await mongoDb.updateUser(finalUserId, {
              isActive: true,
              membershipEndDate: newEndDate,
              activeUntil: newEndDate,
              lastPaymentDate: now
            });

            LoggerService.info(`⚡ User ${finalUserId} activity updated. First search: ${isFirstPurchase}, Amount: ${purchaseAmount}$, Added: ${activeMonths} months. Expiry: ${newEndDate}`, {
              context: LogContext.USER
            });
          }
        }

        // Real-time projection of personal sales / purchases into MonthlySummary
        try {
          const { MonthlySummary, User } = await import('./models');
          const yearMonth = new Date().toISOString().slice(0, 7);

          // 1. Update buyer's summary (Personal Purchase Volume)
          await MonthlySummary.updateOne(
            { userId: finalUserId, yearMonth },
            {
              $inc: { personalSalesVolume: purchaseAmount },
              $setOnInsert: { isEligibleForPoolsAndBonuses: false, careerEarnings: 0, poolEarnings: 0, status: "NONE" },
              $set: { updatedAt: new Date() }
            },
            { upsert: true }
          );

          // 2. Update sponsor's summary (Personal Referral Sales Volume)
          const buyerUser = await User.findOne({ id: finalUserId });
          if (buyerUser && buyerUser.sponsorId) {
            await MonthlySummary.updateOne(
              { userId: buyerUser.sponsorId, yearMonth },
              {
                $inc: { personalSalesVolume: purchaseAmount },
                $setOnInsert: { isEligibleForPoolsAndBonuses: false, careerEarnings: 0, poolEarnings: 0, status: "NONE" },
                $set: { updatedAt: new Date() }
              },
              { upsert: true }
            );
          }
        } catch (sumErr) {
          console.error("Error updating MonthlySummary purchase volume:", sumErr);
        }

        try {
          const { getCacheManager } = await import("../config/cache.config");
          const cache = await getCacheManager();
          await cache.delete(`user:eligibility:${finalUserId}`);
          await cache.delete(`user:challenges:${finalUserId}`);

          const buyerUser = await mongoDb.getUserById(finalUserId);
          if (buyerUser && buyerUser.sponsorId) {
            await cache.delete(`user:eligibility:${buyerUser.sponsorId}`);
            await cache.delete(`user:challenges:${buyerUser.sponsorId}`);
          }
        } catch (err) {
          console.error("Error invalidating cache in fulfillProductPurchase:", err);
        }

      } catch (err) {
        LoggerService.error('Error updating career or active status during fulfillment', { error: err });
      }
    }

    return { success: true, purchaseId: resultPurchase.id };
  } catch (error) {
    LoggerService.error('Fulfillment error', { error, productId, buyerEmail });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
