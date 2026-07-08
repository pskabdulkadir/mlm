import { mlmDb } from "../mlm-database";
import { DistributionLockService } from "../services/distribution-lock.service";
import { shouldUseMongoose } from "../feature-flags";
import { PassiveIncomePool, WalletTransaction } from "../models";
import mongoose from "mongoose";
import cron from "node-cron";

const BATCH_SIZE = parseInt(process.env.PASSIVE_DISTRIBUTION_BATCH_SIZE || "1000", 10);

// Instance ID oluştur (her sunucu instance'ı için unique)
const INSTANCE_ID = `instance-${process.pid}-${Date.now()}`;

/**
 * Passive income dağıtımı yap (lock ile korunmuş)
 */
async function executePassiveDistribution() {
  // 1. Lock almayı dene
  const lockResult = await DistributionLockService.acquirePassiveDistributionLock(INSTANCE_ID);
  
  if (!lockResult.success) {
    console.log(`⏳ Passive distribution atlandı: ${lockResult.message}`);
    return;
  }

  try {
    console.log('🔒 Passive distribution lock alındı, dağıtım başlatılıyor...');

    if (shouldUseMongoose('pools')) {
      // Mongoose ile dağıtım
      await executePassiveDistributionMongoose();
    } else {
      // File-based ile dağıtım
      await executePassiveDistributionFile();
    }

    console.log('✅ Passive distribution tamamlandı');
  } catch (error) {
    console.error('❌ Passive distribution hatasi:', error);
  } finally {
    // 2. Lock'u mutlaka serbest bırak
    const releaseResult = await DistributionLockService.releasePassiveDistributionLock(INSTANCE_ID);
    if (releaseResult.success) {
      console.log('🔓 Passive distribution lock serbest bırakıldı');
    } else {
      console.error('❌ Lock serbest bırakılamadı:', releaseResult.message);
    }
  }
}

/**
 * Mongoose ile passive income dağıtımı
 */
async function executePassiveDistributionMongoose() {
  try {
    const { default: MonolineCommissionService } = await import('../monoline-commission-service');
    const result = await MonolineCommissionService.distributePassivePool();
    console.log('📊 Mongoose passive performance distribution result:', result);
  } catch (error) {
    console.error('❌ Mongoose passive distribution hatasi:', error);
    throw error;
  }
}

/**
 * File-based ile passive income dağıtımı
 */
async function executePassiveDistributionFile() {
  try {
    const db = await mlmDb;
    await db.db.read();
    
    const pool = db.db.data.passiveIncomePool?.totalAmount || 0;
    if (!pool || pool <= 0) {
      console.log('💰 Passive income pool boş, dağıtım yapılmadı');
      return;
    }

    const userIds = db.userIds || Object.values(db.indices?.referral || {});
    if (!userIds || userIds.length === 0) {
      console.log('👥 Kullanıcı yok, dağıtım yapılmadı');
      return;
    }

    const count = Math.min(userIds.length, BATCH_SIZE);
    const perUser = Math.floor((pool / count) * 100) / 100; // Cent'e yuvarla

    if (perUser <= 0) {
      console.log('💰 Kişi başı tutar çok küçük, dağıtım yapılmadı');
      return;
    }

    const transactions: any[] = [];
    for (let i = 0; i < count; i++) {
      transactions.push({ 
        recipientId: userIds[i], 
        amount: perUser, 
        type: 'passive', 
        description: 'Passive pool distribution',
        reference: `PASSIVE-${Date.now()}-${userIds[i]}`
      });
    }

    const totalDistributed = perUser * transactions.length;
    
    // İşlemleri oluştur
    const res = await db.createMonolineCommissionTransactions(transactions);

    // Pool'dan düş
    db.db.data.passiveIncomePool.totalAmount = Math.max(0, (db.db.data.passiveIncomePool.totalAmount || 0) - totalDistributed);
    db.db.data.passiveIncomePool.lastUpdated = new Date();
    await db.db.write();

    console.log(`✅ Passive distribution: ${totalDistributed} TL, ${transactions.length} kullanıcıya dağıtıldı. Sonuç:`, res);

  } catch (error) {
    console.error('❌ File-based passive distribution hatasi:', error);
    throw error;
  }
}

/**
 * Passive distribution scheduler'ı başlat
 * Aylık otonom motor olarak her ayın 1. günü çalışacak şekilde kurulur.
 */
export function startPassiveDistribution() {
  console.log('📆 Passive distribution scheduler başlatılıyor (Aylık Otonom Motor)...');
  console.log('🔒 Distributed lock koruması aktif. Instance ID:', INSTANCE_ID);

  // Aylık olarak her ayın 1. günü saat 00:05'te çalıştır (Aylık Reset 00:00'da çalışır)
  cron.schedule('5 0 1 * *', async () => {
    console.log('⏰ Monthly autonomous passive distribution triggered by cron schedule.');
    await executePassiveDistribution();
  });
}

/**
 * Manuel dağıtım için export
 */
export { executePassiveDistribution };