// ============================================================
//  AKN GROUP — Commission Service (v2 — Dinamik Fiyat)
//  %50 Şirket Fonu | %25 Direkt Sponsor | %15 Unilevel (Derinlik) | %10 Monoline Havuz
// ============================================================

import mongoose from 'mongoose';
import { User, MembershipPackage } from '../../shared/mlm-types';
import {
  COMMISSION_RATES,
  UNILEVEL_RATES,
  MAX_UNILEVEL_DEPTH,
  calculateSponsorBonus,
  calculateUnilevelCommission,
  calculateCompanyFund,
  calculateMonolinePoolContribution,
} from '../../shared/mlmRules';

export interface CommissionCalculation {
  userId: string;
  type: 'sponsor' | 'unilevel' | 'leadership' | 'passive' | 'company_fund';
  amount: number;
  percentage: number;
  sourceUserId?: string;
  sourcePackage?: string;
  level: number;
  timestamp: Date;
}

export interface BonusCalculation {
  userId: string;
  type: 'package' | 'team' | 'performance' | 'monthly';
  amount: number;
  percentage: number;
  sourceAmount: number;
  details: string;
  timestamp: Date;
}

export interface CommissionBreakdown {
  productPrice: number;
  companyFund: number;        // %60 — dağıtılmaz, loglanır
  directSponsor: number;      // %25 — direkt sponsora
  unilevelTotal: number;      // %10 — 7 seviyeye dağıtılır
  monolinePool: number;       // %5  — havuza eklenir
  transactions: CommissionCalculation[];
}

export class CommissionService {

  // ── Ana hesaplama fonksiyonu (Herhangi bir ürün fiyatı için) ──────────────
  static async calculatePackagePurchaseCommissions(
    purchasingUser: User,
    membershipPackage: MembershipPackage,
    allUsers: User[]
  ): Promise<CommissionCalculation[]> {
    const commissions: CommissionCalculation[] = [];
    const price = membershipPackage.price;

    // ── 1. Şirket Fonu (%60) — kullanıcı cüzdanına dağıtılmaz, sadece log ──
    commissions.push({
      userId: 'system',
      type: 'company_fund',
      amount: calculateCompanyFund(price),
      percentage: COMMISSION_RATES.companyFund,
      sourceUserId: purchasingUser.id,
      sourcePackage: membershipPackage.id,
      level: 0,
      timestamp: new Date(),
    });

    // ── 2. Direkt Sponsor Primi (%25) ────────────────────────────────────────
    if (purchasingUser.sponsorId) {
      const sponsor = allUsers.find(u => u.id === purchasingUser.sponsorId);
      if (sponsor?.isActive) {
        commissions.push({
          userId: sponsor.id,
          type: 'sponsor',
          amount: calculateSponsorBonus(price),
          percentage: COMMISSION_RATES.directSponsor,
          sourceUserId: purchasingUser.id,
          sourcePackage: membershipPackage.id,
          level: 1,
          timestamp: new Date(),
        });
      }
    }

    // ── 3. 7 Derinlik Unilevel (%10 toplam) ──────────────────────────────────
    //    L1:%3 | L2:%2 | L3:%1.5 | L4:%1.5 | L5:%1 | L6:%0.5 | L7:%0.5
    const sponsorChain = this.getSponsorChain(purchasingUser, allUsers, MAX_UNILEVEL_DEPTH);

    sponsorChain.forEach((upline, index) => {
      const lvl = index + 1; // L1..L7
      if (lvl > MAX_UNILEVEL_DEPTH) return;
      const rate = UNILEVEL_RATES[lvl] ?? 0;
      if (rate === 0 || !upline.isActive) return;

      commissions.push({
        userId: upline.id,
        type: 'unilevel',
        amount: calculateUnilevelCommission(price, lvl),
        percentage: rate,
        sourceUserId: purchasingUser.id,
        sourcePackage: membershipPackage.id,
        level: lvl,
        timestamp: new Date(),
      });
    });

    // ── 4. Monoline Havuz payı (%5) — havuza aktarılır ───────────────────────
    commissions.push({
      userId: 'monoline_pool',
      type: 'passive',
      amount: calculateMonolinePoolContribution(price),
      percentage: COMMISSION_RATES.monolinePool,
      sourceUserId: purchasingUser.id,
      sourcePackage: membershipPackage.id,
      level: 0,
      timestamp: new Date(),
    });

    return commissions;
  }

  // ── Tam dağılım özeti ─────────────────────────────────────────────────────
  static buildBreakdown(productPrice: number): CommissionBreakdown {
    return {
      productPrice,
      companyFund:    calculateCompanyFund(productPrice),
      directSponsor:  calculateSponsorBonus(productPrice),
      unilevelTotal:  Math.round(productPrice * (((COMMISSION_RATES as any).unilevel || 10) / 100) * 100) / 100,
      monolinePool:   calculateMonolinePoolContribution(productPrice),
      transactions:   [],
    };
  }

  // ── Cüzdanlara uygula ─────────────────────────────────────────────────────
  static async applyCommissionsToWallet(
    commissions: CommissionCalculation[],
    bonuses: BonusCalculation[]
  ): Promise<boolean> {
    const { applyWalletTransactions } = await import('./wallet-transaction.service');

    // Şirket fonu ve havuz payını filtrele (bunlar kullanıcı cüzdanına gitmez)
    const userCommissions = commissions.filter(
      c => c.userId !== 'system' && c.userId !== 'monoline_pool'
    );

    const transactions = [
      ...userCommissions.map(c => ({
        userId: c.userId,
        amount: c.amount,
        type: c.type === 'sponsor' ? 'DIRECT' : 'CAREER',
        reference: `COMM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: c.type === 'sponsor'
          ? `Direkt Sponsor Primi (%${COMMISSION_RATES.directSponsor})`
          : `Unilevel Prim L${c.level} (%${UNILEVEL_RATES[c.level] ?? 0})`,
      })),
      ...bonuses.map(b => ({
        userId: b.userId,
        amount: b.amount,
        type: b.type,
        reference: `BONUS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: b.details,
      })),
    ];

    await applyWalletTransactions(transactions);
    return true;
  }

  // ── Yardımcı: sponsor zinciri ─────────────────────────────────────────────
  private static getSponsorChain(user: User, allUsers: User[], levels: number): User[] {
    const chain: User[] = [];
    let current = user;
    const visited = new Set<string>();

    for (let i = 0; i < levels; i++) {
      if (!current.sponsorId) break;
      if (visited.has(current.sponsorId)) break; // Döngü koruması
      const sponsor = allUsers.find(u => u.id === current.sponsorId);
      if (!sponsor) break;
      visited.add(sponsor.id);
      chain.push(sponsor);
      current = sponsor;
    }

    return chain;
  }

  private static getTeamSize(user: User, allUsers: User[]): number {
    const direct = allUsers.filter(u => u.sponsorId === user.id);
    return direct.reduce((sum, r) => sum + 1 + this.getTeamSize(r, allUsers), 0);
  }

  private static getTeamTotalEarnings(user: User, allUsers: User[]): number {
    const direct = allUsers.filter(u => u.sponsorId === user.id);
    return direct.reduce(
      (sum, r) => sum + r.wallet.totalEarnings + this.getTeamTotalEarnings(r, allUsers),
      0
    );
  }

  // ── Aylık performans bonusları ────────────────────────────────────────────
  static async calculateMonthlyPerformanceBonuses(
    user: User,
    allUsers: User[]
  ): Promise<BonusCalculation[]> {
    const bonuses: BonusCalculation[] = [];

    const teamSize = this.getTeamSize(user, allUsers);
    if (teamSize >= 10) {
      bonuses.push({
        userId: user.id,
        type: 'performance',
        amount: Math.floor(teamSize / 10) * 25,
        percentage: 0,
        sourceAmount: teamSize,
        details: `Ekip büyüklük bonusu: ${teamSize} üye`,
        timestamp: new Date(),
      });
    }

    const totalTeamEarnings = this.getTeamTotalEarnings(user, allUsers);
    if (totalTeamEarnings >= 1000) {
      bonuses.push({
        userId: user.id,
        type: 'performance',
        amount: Math.round(totalTeamEarnings * 0.02 * 100) / 100,
        percentage: 2,
        sourceAmount: totalTeamEarnings,
        details: `Liderlik bonusu: Ekip kazancının %2'si`,
        timestamp: new Date(),
      });
    }

    return bonuses;
  }
}

export default CommissionService;
