// ============================================================
//  AKN GROUP — Points & Career Service (v2 — 10 Kariyer)
// ============================================================

import { User, CareerLevel as CareerLevelType, Transaction, PointsSystem } from '../../shared/mlm-types';
import {
  CAREER_LEVELS_CONFIG,
  CAREER_CONFIG_MAP,
  CareerLevel,
  getCareerLevel as calculateCareerLevel,
  UNILEVEL_RATES,
  MAX_UNILEVEL_DEPTH,
} from '../../shared/mlmRules';

export interface PointTransaction {
  id: string;
  userId: string;
  type: string;
  points: number;
  source: {
    type: string;
    sourceId?: string;
    description: string;
    amount?: number;
  };
  timestamp: Date;
}

export interface CareerProgress {
  currentLevel: CareerLevelType;
  nextLevel?: CareerLevelType;
  progress: any;
  canUpgrade: boolean;
  nextLevelRequirements?: string[];
}

export class PointsCareerService {

  // ── 10 Kariyer Seviyesi (DB için hazır) ─────────────────────────────────
  static getDefaultCareerLevels(): CareerLevelType[] {
    return CAREER_LEVELS_CONFIG.map(cfg => ({
      id:            cfg.name.toLowerCase().replace(/\s+/g, '-').replace(/İ/g, 'i'),
      name:          cfg.name as any,
      displayName:   cfg.displayName,
      description:   `${cfg.displayName} mertebesi — Monoline derinlik limiti: ${cfg.monolineDepthLimit === 999999 ? 'Sonsuz' : cfg.monolineDepthLimit} sıra`,
      minInvestment: cfg.requiredUSD,
      minDirectReferrals: cfg.requiredDirectReferrals,
      personalSalesPoints: Math.floor(cfg.requiredUSD * 0.1),
      teamSalesPoints:     cfg.requiredUSD, // Bu unilevel cirosu olarak kullanılıyor
      commissionRate:      cfg.bonusPercent,
      level:               cfg.order,
      monolineDepthLimit:  cfg.monolineDepthLimit,
      passiveIncomeRate:   cfg.depthBonusPercent || 0,
      bonus:               cfg.requiredUSD * 0.1,
      requirements: {
        personalSalesPoints:   Math.floor(cfg.requiredUSD * 0.1),
        teamSalesPoints:       cfg.requiredUSD,
        directReferrals:       cfg.requiredDirectReferrals,
        minimumMonthlyPoints:  Math.floor(cfg.requiredUSD * 0.05),
      } as any,
      benefits: {
        directSalesCommission: cfg.bonusPercent,
        teamBonusRate:         Math.max(1, cfg.order - 1),
        monthlyBonus:          cfg.requiredUSD * 0.05,
        rankBonus:             cfg.requiredUSD * 0.1,
        monolineDepthLimit:    cfg.monolineDepthLimit,
      },
      order:    cfg.order,
      isActive: true,
    }));
  }

  static async awardPoints(
    userId: string,
    type: string,
    points: number,
    description: string,
    allUsers?: any[]
  ): Promise<any> {
    console.log(`Awarding points: ${points} to ${userId} of type ${type} (${description})`);
    const { mlmDb } = await import('./mlm-database');
    const user = await mlmDb.getUserById(userId);
    if (!user) return null;
    
    // Update user's points system
    const pSystem = user.pointsSystem || {
      personalSalesPoints: 0,
      teamSalesPoints: 0,
      directReferrals: 0,
      minimumMonthlyPoints: 0,
      registrationPoints: 0,
      totalPoints: 0,
      monthlyPoints: 0,
    };
    
    const newTotal = (pSystem.totalPoints || 0) + points;
    const newMonthly = (pSystem.monthlyPoints || 0) + points;
    
    await mlmDb.updateUser(userId, {
      pointsSystem: {
        ...pSystem,
        totalPoints: newTotal,
        monthlyPoints: newMonthly,
        lastPointUpdate: new Date(),
      }
    });
    
    return { success: true };
  }

  /**
   * Bir alışveriş gerçekleştiğinde üst sponsorların toplam unilevel cirosunu güncelleyen 
   * ve kariyer atlayıp atlamadıklarını kontrol eden ana servis metodu.
   */
  static async processCareerUpdate(
    buyerUserId: string,
    saleAmount: number
  ): Promise<void> {
    const { mlmDb } = await import('./mlm-database');
    const { CAREER_CONFIG_MAP, calculateCareerLevel } = await import('../../shared/mlmRules');
    
    const buyer = await mlmDb.getUserById(buyerUserId);
    if (!buyer) return;

    // Alıcının kendi cirosunu güncelle
    await mlmDb.updateUser(buyer.id, {
      teamTurnoverUSD: (buyer.teamTurnoverUSD || 0) + saleAmount,
      monthlySalesVolume: (buyer.monthlySalesVolume || 0) + saleAmount,
      total_team_ciro: (buyer.total_team_ciro || 0) + saleAmount,
    });

    // Üst sponsorları tara ve güncelle
    let currentSponsorId = buyer.sponsorId;
    let depth = 1;
    const visited = new Set<string>([buyer.id]);

    while (currentSponsorId && depth <= 100) {
      if (visited.has(currentSponsorId)) break;
      const sponsor = await mlmDb.getUserById(currentSponsorId);
      if (!sponsor) break;

      visited.add(sponsor.id);
      
      const newCiro = (sponsor.teamTurnoverUSD || 0) + saleAmount;
      
      // Get real direct referrals count from database dynamically
      const directs = await mlmDb.getDirectReferrals(sponsor.id);
      const actualDirectReferralsCount = Math.max(sponsor.directReferrals || 0, directs ? directs.length : 0);
      
      // Kariyer kontrolü
      const newCareerName = calculateCareerLevel({
        teamTurnoverUSD: newCiro,
        directReferrals: actualDirectReferralsCount
      });

      const oldCareerName = (sponsor.careerLevel as any)?.name || sponsor.careerLevel || 'Mülhime';
      
      const updates: any = {
        teamTurnoverUSD: newCiro,
        directReferrals: actualDirectReferralsCount,
        total_team_ciro: newCiro,
        direct_references: actualDirectReferralsCount,
      };

      if (newCareerName !== oldCareerName) {
        updates.careerLevel = {
          ...sponsor.careerLevel,
          name: newCareerName,
          displayName: CAREER_CONFIG_MAP[newCareerName].displayName,
          order: CAREER_CONFIG_MAP[newCareerName].order,
        };
        console.log(`🎊 Kariyer Atladı! ${sponsor.fullName}: ${oldCareerName} -> ${newCareerName}`);

        // AUTOMATIC CAREER BONUS PAYMENT
        try {
          const newCareerConfig = CAREER_CONFIG_MAP[newCareerName];
          const rankBonus = (newCareerConfig.requiredUSD || 0) * 0.1; // 10% of required USD as rank bonus

          if (rankBonus > 0) {
            const { applyWalletTransactions } = await import('./wallet-transaction.service');
            await applyWalletTransactions([{
              userId: sponsor.id,
              amount: rankBonus,
              type: 'CAREER_RANK_BONUS',
              reference: `CAREER-${newCareerName}-${Date.now()}`,
              description: `Kariyer Yükselmesi Bonusu: ${oldCareerName} → ${newCareerName}`,
              status: 'PAID'
            }]);

            console.log(`💰 Otomatik Kariyer Bonusu Ödendi: ${sponsor.fullName} = $${rankBonus.toFixed(2)} (${newCareerName})`);
          }
        } catch (bonusErr) {
          console.error(`Kariyer bonus ödeme hatası (${sponsor.id}):`, bonusErr);
        }
      }

      // NOTE: Autonomous engine sync removed (not canonical)
      // Career level is already determined by PointsCareerService.calculateCareerLevel()
      // (lines 153-156 above)
      // If needed in future, use MlmRules directly instead of MlmEngineBridge

      await mlmDb.updateUser(sponsor.id, updates);

      currentSponsorId = sponsor.sponsorId;
      depth++;
    }
  }

  // ── Puan hesaplamaları ───────────────────────────────────────────────────
  static calculatePointsForSale(saleAmount: number, saleType: 'product' | 'membership'): number {
    return Math.floor(saleAmount); // 1 USD = 1 puan
  }

  static calculateTeamSalesPoints(saleAmount: number, level: number): number {
    // Unilevel seviyeleri ile orantılı ağırlık
    const rate = UNILEVEL_RATES[level] ?? 0;
    return Math.floor(saleAmount * (rate / 100));
  }

  static getRegistrationPoints(): number {
    return 50; // Her doğrudan kayıt için sabit 50 puan
  }

  // ── Satış puanı ödülü (ve Ciro Güncellemesi) ────────────────────────────────────────────────────
  static async awardSalePoints(
    buyerUserId: string,
    saleAmount: number,
    saleType: 'product' | 'membership',
    allUsers: User[]
  ): Promise<{ transactions: PointTransaction[], updatedUsers: User[] }> {
    const transactions: PointTransaction[] = [];
    let updatedUsers = [...allUsers];

    const buyer = updatedUsers.find(u => u.id === buyerUserId);
    if (!buyer) return { transactions: [], updatedUsers: allUsers };

    // 1. Alıcının kendi cirosuna (veya kişisel puanına) ekle
    const personalPoints = this.calculatePointsForSale(saleAmount, saleType);
    
    updatedUsers = updatedUsers.map(u =>
      u.id !== buyerUserId ? u : {
        ...u,
        monthlySalesVolume: (u.monthlySalesVolume || 0) + saleAmount,
        teamTurnoverUSD: (u.teamTurnoverUSD || 0) + saleAmount, // Toplam ciro (USD)
        pointsSystem: {
          ...u.pointsSystem,
          personalSalesPoints: (u.pointsSystem?.personalSalesPoints || 0) + personalPoints,
          totalPoints: (u.pointsSystem?.totalPoints || 0) + personalPoints,
          monthlyPoints: (u.pointsSystem?.monthlyPoints || 0) + personalPoints,
          lastPointUpdate: new Date(),
        },
      }
    );

    // 2. TÜM üst sponsorların cirosunu güncelle (Unilevel organizasyonu)
    // Talimat: "üst sponsorların toplam unilevel cirosunu (teamCiro) güncelleyen"
    let currentSponsorId = buyer.sponsorId;
    let depth = 1;
    const visited = new Set<string>([buyer.id]);

    while (currentSponsorId && depth <= 100) { // Genellikle tüm derinlik boyunca ciro eklenir
      if (visited.has(currentSponsorId)) break;
      const sponsor = updatedUsers.find(u => u.id === currentSponsorId);
      if (!sponsor) break;

      visited.add(sponsor.id);

      // Sponsorun cirosunu güncelle
      updatedUsers = updatedUsers.map(u => {
        if (u.id !== sponsor.id) return u;

        const newCiro = (u.teamTurnoverUSD || 0) + saleAmount;
        
        // Count direct referrals in-memory securely
        const directsCountInAllUsers = updatedUsers.filter(x => x.sponsorId === u.id).length;
        const actualDirectReferralsCount = Math.max(u.directReferrals || 0, directsCountInAllUsers);
        
        // Kariyer kontrolü yap
        const newCareerName = calculateCareerLevel({
          teamTurnoverUSD: newCiro,
          directReferrals: actualDirectReferralsCount
        });

        const oldCareerName = (u.careerLevel as any)?.name || u.careerLevel || 'Mülhime';
        
        const finalCareer = (newCareerName !== oldCareerName) ? {
          ...(u.careerLevel as any),
          name: newCareerName,
          displayName: CAREER_CONFIG_MAP[newCareerName].displayName,
          order: CAREER_CONFIG_MAP[newCareerName].order,
        } : u.careerLevel;

        return {
          ...u,
          teamTurnoverUSD: newCiro,
          directReferrals: actualDirectReferralsCount,
          careerLevel: finalCareer,
        };
      });

      currentSponsorId = sponsor.sponsorId;
      depth++;
    }

    // Puan işlemlerini (ve gerekirse DB kayıtlarını) burada veya çağıran yerde yapmalıyız.
    // Şimdilik güncellenmiş listeyi dönüyoruz.
    return { transactions, updatedUsers };
  }

  // ── Kayıt puanı ödülü ────────────────────────────────────────────────────
  static async awardRegistrationPoints(
    sponsorUserId: string,
    newUserId: string,
    allUsers: User[]
  ): Promise<{ transactions: PointTransaction[], updatedUsers: User[] }> {
    const transactions: PointTransaction[] = [];
    let updatedUsers = [...allUsers];

    const sponsor = updatedUsers.find(u => u.id === sponsorUserId);
    const newUser = updatedUsers.find(u => u.id === newUserId);
    if (!sponsor || !newUser) throw new Error('Sponsor or new user not found');

    const registrationPoints = this.getRegistrationPoints();
    transactions.push({
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: sponsorUserId,
      type: 'registration',
      points: registrationPoints,
      source: {
        type: 'registration',
        sourceId: newUserId,
        description: `Yeni üye kaydı: ${newUser.fullName}`,
      },
      timestamp: new Date(),
    });

    updatedUsers = updatedUsers.map(u =>
      u.id !== sponsorUserId ? u : {
        ...u,
        pointsSystem: {
          ...u.pointsSystem,
          registrationPoints: u.pointsSystem.registrationPoints + registrationPoints,
          totalPoints: u.pointsSystem.totalPoints + registrationPoints,
          monthlyPoints: u.pointsSystem.monthlyPoints + registrationPoints,
          lastPointUpdate: new Date(),
        },
      }
    );

    return { transactions, updatedUsers };
  }

  // ── Kariyer seviyesi kontrol ─────────────────────────────────────────────
  static checkCareerLevelUpgrade(user: User, careerLevels: CareerLevelType[]): {
    shouldUpgrade: boolean;
    newLevel?: CareerLevelType;
    oldLevel: CareerLevelType | any;
  } {
    const sortedLevels = [...careerLevels].sort((a, b) => a.order - b.order);
    const currentLevelIndex = sortedLevels.findIndex(l => l.id === (user.careerLevel as any).name);

    for (let i = currentLevelIndex + 1; i < sortedLevels.length; i++) {
      if (this.meetsRequirements(user, sortedLevels[i])) {
        return { shouldUpgrade: true, newLevel: sortedLevels[i], oldLevel: user.careerLevel };
      }
    }

    return { shouldUpgrade: false, oldLevel: user.careerLevel };
  }

  // ── Gereksinimler karşılandı mı? ─────────────────────────────────────────
  static meetsRequirements(user: User, level: CareerLevelType): boolean {
    const req = level.requirements || (level as any);
    const requiredUSD = req.teamTurnoverUSD || req.teamSalesPoints || req.requiredUSD || 0;
    const directReferrals = req.requiredDirectReferrals || req.directReferrals || 0;

    return (
      (user.teamTurnoverUSD || 0) >= requiredUSD &&
      (user.directReferrals || 0) >= directReferrals
    );
  }

  // ── Kariyer ilerlemesi ───────────────────────────────────────────────────
  static getCareerProgress(user: User, careerLevels: CareerLevelType[]): CareerProgress {
    const currentCareerName = (user.careerLevel as any)?.name || user.careerLevel || 'Mülhime';
    const currentLevel = careerLevels.find(l => l.name === currentCareerName) || careerLevels[0];
    const sortedLevels = [...careerLevels].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLevels.findIndex(l => l.name === currentLevel.name);
    const nextLevel = currentIndex < sortedLevels.length - 1 ? sortedLevels[currentIndex + 1] : undefined;

    const req = nextLevel?.requirements || {} as any;
    const requiredUSD = req.teamTurnoverUSD || req.teamSalesPoints || req.requiredUSD || 1;
    const requiredDirects = req.requiredDirectReferrals || req.directReferrals || 1;

    const progress = {
      teamTurnoverUSD: {
        current:    user.teamTurnoverUSD || 0,
        required:   requiredUSD,
        percentage: nextLevel ? Math.min(100, ((user.teamTurnoverUSD || 0) / requiredUSD) * 100) : 100,
      },
      directReferrals: {
        current:    user.directReferrals || 0,
        required:   requiredDirects,
        percentage: nextLevel ? Math.min(100, ((user.directReferrals || 0) / requiredDirects) * 100) : 100,
      }
    };

    return {
      currentLevel,
      nextLevel,
      progress,
      canUpgrade: nextLevel ? this.meetsRequirements(user, nextLevel) : false,
      nextLevelRequirements: nextLevel ? [
        `${requiredUSD} USD Ekip Cirosu`,
        `${requiredDirects} Doğrudan Referans`,
      ] : undefined,
    };
  }

  // ── Kariyer bonusu hesapla ───────────────────────────────────────────────
  static calculateCareerBonuses(user: User, careerLevels: CareerLevelType[]): {
    monthlyBonus: number;
    rankBonus: number;
    totalBonus: number;
  } {
    try {
      const userCareerName = (user.careerLevel as any)?.name || user.careerLevel || 'Mülhime';
      const userLevel = careerLevels.find(l => l.name === userCareerName) || careerLevels[0];
      if (!userLevel) return { monthlyBonus: 0, rankBonus: 0, totalBonus: 0 };

      const monthlyBonus = userLevel.benefits?.monthlyBonus || 0;
      const rankBonus    = userLevel.benefits?.rankBonus    || 0;
      return { monthlyBonus, rankBonus, totalBonus: monthlyBonus + rankBonus };
    } catch {
      return { monthlyBonus: 0, rankBonus: 0, totalBonus: 0 };
    }
  }

  // ── Aylık puan sıfırlama ─────────────────────────────────────────────────
  static resetMonthlyPoints(users: User[]): User[] {
    return users.map(user => ({
      ...user,
      pointsSystem: { ...user.pointsSystem, monthlyPoints: 0, lastPointUpdate: new Date() },
    }));
  }

  // ── Yardımcı: upline zinciri ─────────────────────────────────────────────
  private static getUplineChain(user: User, allUsers: User[], maxLevels: number): User[] {
    const chain: User[] = [];
    let current = user;
    const visited = new Set<string>([current.id]);

    for (let i = 0; i < maxLevels; i++) {
      if (!current.sponsorId) break;
      if (visited.has(current.sponsorId)) break;
      const sponsor = allUsers.find(u => u.id === current.sponsorId);
      if (!sponsor) break;
      visited.add(sponsor.id);
      chain.push(sponsor);
      current = sponsor;
    }
    return chain;
  }
}

export default PointsCareerService;
