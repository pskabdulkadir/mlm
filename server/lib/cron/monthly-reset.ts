import cron from 'node-cron';
import mongoose from 'mongoose';
import { User } from '../models';
import { WalletTransaction, User as UserModel, CommissionAudit } from '../models';
import LoggerService, { LogContext } from '../logger';

/**
 * Otomatik Reset İşlemleri
 * 1. Aylık Reset (Her ayın 1'i 00:00): Aylık limitleri sıfırlar, HELD kazançları serbest bırakır.
 * 2. Günlük Reset (Her gün 00:00): Günlük limitleri sıfırlar.
 */
export const monthlyResetJob = () => {

  // 📅 AYLIK RESET (Her ayın 1. günü saat 00:00)
  cron.schedule('0 0 1 * *', async () => {
    LoggerService.info('📅 Monthly reset job started', { context: LogContext.SYSTEM });
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Kullanıcı bazlı aylık kazanç sayaçlarını sıfırla
      const userUpdateResult = await User.updateMany(
        {},
        {
          $set: {
            'wallet.monthlyEarnings': 0,
            monthlySalesVolume: 0
          }
        },
        { session }
      );
      LoggerService.info(`✅ Reset monthly counters for ${userUpdateResult.modifiedCount} users`, { context: LogContext.SYSTEM });

      // 2️⃣ HELD (Bekleyen) kazançları kontrol et ve serbest bırak (Koşullu - Sadece en az $100 ciro yapanlar için)
      const { MonolineCommissionService } = await import('../lib/monoline-commission-service');
      const releaseResult = await MonolineCommissionService.releaseHeldCommissionsForEligibleUsers(session);
      const releasedCount = releaseResult.releasedCount;
      const totalReleasedAmount = releaseResult.totalAmount;

      // Audit log
      if (releasedCount > 0) {
        await CommissionAudit.create([{
          userId: 'system',
          action: 'RELEASED',
          amount: totalReleasedAmount,
          reason: `Monthly reset - Released ${releasedCount} HELD transactions for eligible users`,
          performedBy: 'monthly-reset-cron',
          timestamp: new Date(),
          metadata: {
            releasedTransactions: releasedCount,
            totalAmount: totalReleasedAmount
          }
        }], { session });
      }

      await session.commitTransaction();
      LoggerService.info(`✅ Monthly reset completed. Released ${releasedCount} HELD transactions for eligible users.`, { context: LogContext.SYSTEM });

    } catch (err) {
      await session.abortTransaction();
      LoggerService.error('❌ Monthly reset failed', { error: err, context: LogContext.SYSTEM });
    } finally {
      session.endSession();
    }
  });

  // 📅 GÜNLÜK RESET (Her gün saat 00:00)
  cron.schedule('0 0 * * *', async () => {
    LoggerService.info('📅 Daily reset job started', { context: LogContext.SYSTEM });
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await User.updateMany(
        {},
        { $set: { 'wallet.dailyEarnings': 0 } },
        { session }
      );
      LoggerService.info(`✅ Daily earnings counters reset for ${result.modifiedCount} users`, { context: LogContext.SYSTEM });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      LoggerService.error('❌ Daily reset failed', { error: err, context: LogContext.SYSTEM });
    } finally {
      session.endSession();
    }
  });

  LoggerService.info('⏰ Cron jobs initialized: Monthly & Daily Reset', { context: LogContext.SYSTEM });
};
