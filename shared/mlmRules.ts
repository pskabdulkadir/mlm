// ============================================================
//  AKN GROUP — MLM Rules & Commission Configuration (shared)
// ============================================================

export const MAX_UNILEVEL_DEPTH = 7;

export const UNILEVEL_RATES: Record<number, number> = {
  1: 5, // %5
  2: 3, // %3
  3: 2, // %2
  4: 2, // %2
  5: 1, // %1
  6: 1, // %1
  7: 1, // %1
};

export const COMMISSION_RATES = {
  companyFund: 50,       // %50 System / Company Share
  directSponsor: 25,     // %25 Sponsor Bonus
  monolinePool: 10,      // %10 Monoline Pool Distribution / Passive Income
};

// Note: Unilevel Depth Commission (15%) is calculated from UNILEVEL_RATES array above (5+3+2+2+1+1+1)

export interface CareerLevel {
  id: string;
  name: string;
  displayName: string;
  requiredUSD: number;
  requiredDirectReferrals: number;
  requiredTeamCiroTL?: number;
  requiredActivePeople?: number;
  bonusPercent: number;
  order: number;
  monolineDepthLimit: number;
  depthBonusPercent?: number;
}

// 10 Spiritual Career Configs (10 Nefis Mertebesi - Kariyer Sistemi)
export const CAREER_LEVELS_CONFIG = [
  { name: 'Nefs-i Emmare', displayName: 'Nefs-i Emmare', order: 0, requiredUSD: 0, requiredDirectReferrals: 0, bonusPercent: 0, monolineDepthLimit: 1, depthBonusPercent: 0, depth: "1 Sıra", description: "Yolculuğun başlangıcı öncesi nefs durumu" },
  { name: 'Mülhime', displayName: 'Nefs-i Mülhime', order: 1, requiredUSD: 500, requiredDirectReferrals: 2, bonusPercent: 3, monolineDepthLimit: 10, depthBonusPercent: 0.5, depth: "10 Sıra", description: "Yolculuğun başlangıcı" },
  { name: 'Mutmainne', displayName: 'Nefs-i Mutmainne', order: 2, requiredUSD: 1500, requiredDirectReferrals: 3, bonusPercent: 4, monolineDepthLimit: 20, depthBonusPercent: 1.0, depth: "20 Sıra", description: "Huzura eriş" },
  { name: 'Radiye', displayName: 'Nefs-i Radiye', order: 3, requiredUSD: 3500, requiredDirectReferrals: 4, bonusPercent: 5, monolineDepthLimit: 40, depthBonusPercent: 1.5, depth: "40 Sıra", description: "Rıza makamı bidayet" },
  { name: 'Mardiyye', displayName: 'Nefs-i Mardiyye', order: 4, requiredUSD: 7500, requiredDirectReferrals: 5, bonusPercent: 6, monolineDepthLimit: 60, depthBonusPercent: 2.0, depth: "60 Sıra", description: "Rıza makamı nihayet" },
  { name: 'Safiyye', displayName: 'Nefs-i Safiyye', order: 5, requiredUSD: 15000, requiredDirectReferrals: 6, bonusPercent: 7, monolineDepthLimit: 80, depthBonusPercent: 2.5, depth: "80 Sıra", description: "Asil ve saf nefs" },
  { name: 'Mürşid', displayName: 'Nefs-i Mürşid', order: 6, requiredUSD: 30000, requiredDirectReferrals: 8, bonusPercent: 8, monolineDepthLimit: 100, depthBonusPercent: 3.0, depth: "100 Sıra", description: "Rehberlik makamı" },
  { name: 'Pir', displayName: 'Nefs-i Pir', order: 7, requiredUSD: 60000, requiredDirectReferrals: 10, bonusPercent: 10, monolineDepthLimit: 150, depthBonusPercent: 4.0, depth: "150 Sıra", description: "Liderlik zirvesi" },
  { name: 'Kutub', displayName: 'Nefs-i Kutub', order: 8, requiredUSD: 120000, requiredDirectReferrals: 12, bonusPercent: 12, monolineDepthLimit: 200, depthBonusPercent: 5.0, depth: "200 Sıra", description: "Kozmik merkez" },
  { name: 'Gavs', displayName: 'Nefs-i Gavs', order: 9, requiredUSD: 250000, requiredDirectReferrals: 15, bonusPercent: 15, monolineDepthLimit: 300, depthBonusPercent: 7.0, depth: "300 Sıra", description: "Cihan şümul lider" },
  { name: 'İnsan-ı Kamil', displayName: 'Nefs-i İnsan-ı Kamil', order: 10, requiredUSD: 500000, requiredDirectReferrals: 20, bonusPercent: 20, monolineDepthLimit: 999999, depthBonusPercent: 10.0, depth: "Sonsuz Sıra", description: "Kemalatın zirvesi" },
];

export const LEGACY_CAREER_MAP: Record<string, string> = {
  'Emmare': 'Nefs-i Emmare',
  'Nefs-i Emmare': 'Nefs-i Emmare',
  'Mülhime': 'Mülhime',
  'Nefs-i Mülhime': 'Mülhime',
  'Mülhime ': 'Mülhime',
  'Mulhime': 'Mülhime',
  'Mutmainne': 'Mutmainne',
  'Nefs-i Mutmainne': 'Mutmainne',
  'Radiye': 'Radiye',
  'Nefs-i Radiye': 'Radiye',
  'Mardiyye': 'Mardiyye',
  'Nefs-i Mardiyye': 'Mardiyye',
  'Safiyye': 'Safiyye',
  'Nefs-i Safiyye': 'Safiyye',
  'Safiye': 'Safiyye',
  'Nefs-i Safiye': 'Safiyye',
  'Mürşid': 'Mürşid',
  'Nefs-i Mürşid': 'Mürşid',
  'Pir': 'Pir',
  'Nefs-i Pir': 'Pir',
  'Kutub': 'Kutub',
  'Nefs-i Kutub': 'Kutub',
  'Gavs': 'Gavs',
  'Nefs-i Gavs': 'Gavs',
  'İnsan-ı Kamil': 'İnsan-ı Kamil',
  'Nefs-i İnsan-ı Kamil': 'İnsan-ı Kamil',
};

// Build CAREER_CONFIG_MAP
export const CAREER_CONFIG_MAP: Record<string, typeof CAREER_LEVELS_CONFIG[0]> = {};
CAREER_LEVELS_CONFIG.forEach(cfg => {
  CAREER_CONFIG_MAP[cfg.name] = cfg;
});
// Add aliases for legacy/shorthand names to ensure compatibility
Object.keys(LEGACY_CAREER_MAP).forEach(legacyName => {
  const targetName = LEGACY_CAREER_MAP[legacyName];
  if (CAREER_CONFIG_MAP[targetName]) {
    CAREER_CONFIG_MAP[legacyName] = CAREER_CONFIG_MAP[targetName];
  }
});

export const careerLevels: Record<string, any> = {};
CAREER_LEVELS_CONFIG.forEach(cfg => {
  careerLevels[cfg.name] = cfg;
});
Object.keys(LEGACY_CAREER_MAP).forEach(legacyName => {
  const targetName = LEGACY_CAREER_MAP[legacyName];
  if (careerLevels[targetName]) {
    careerLevels[legacyName] = careerLevels[targetName];
  }
});

// Helper functions
export function getCareerLevelOrder(careerName?: string): number {
  if (!careerName) return 0;
  const normalizedName = LEGACY_CAREER_MAP[careerName] || careerName;
  const config = CAREER_CONFIG_MAP[normalizedName];
  return config ? config.order : 0;
}

export function calculateSponsorBonus(amount: number, careerLevelName?: string): number {
  const baseRate = COMMISSION_RATES.directSponsor; // 10%
  const sponsorOrder = getCareerLevelOrder(careerLevelName);
  const rateMultiplier = sponsorOrder >= 5 ? 1.25 : 1.0; // Safiyye is order 5. So Level 5+ gets +25% extra sponsor bonus.
  const finalRate = baseRate * rateMultiplier; // 10% * 1.25 = 12.5% or 10%
  return amount * (finalRate / 100);
}

export function calculateUnilevelCommission(amount: number, level: number): number {
  const rate = UNILEVEL_RATES[level] || 0;
  return amount * (rate / 100);
}

export function calculateCompanyFund(amount: number): number {
  return amount * (COMMISSION_RATES.companyFund / 100);
}

export function calculateMonolinePoolContribution(amount: number): number {
  return amount * (COMMISSION_RATES.monolinePool / 100);
}

export function getMonolineDepthLimit(careerName: string): number {
  const config = CAREER_CONFIG_MAP[careerName] || CAREER_CONFIG_MAP['Nefs-i Emmare'];
  return config ? config.monolineDepthLimit : 1;
}

export function getCareerLevel(stats: {
  teamTurnoverUSD?: number;
  totalTeamCiroTL?: number;
  directReferrals?: number;
  teamSize?: number;
  legCirosTL?: Record<string, number>;
}): string {
  const ciro = stats.teamTurnoverUSD || stats.totalTeamCiroTL || 0;
  const directs = stats.directReferrals || 0;

  // Search in reverse order from highest to lowest
  const matched = [...CAREER_LEVELS_CONFIG]
    .reverse()
    .find(cfg => ciro >= cfg.requiredUSD && directs >= cfg.requiredDirectReferrals);

  return matched ? matched.name : 'Nefs-i Emmare';
}

export const calculateCareerLevel = getCareerLevel;

export function isActiveMember(user: any): boolean {
  if (!user) return false;
  if (!user.isActive) return false;
  
  if (user.membershipEndDate) {
    return new Date(user.membershipEndDate).getTime() > Date.now();
  }
  return true;
}

export function calculateActiveFee(user: any): number {
  return 200; // Standard $200 activation fee
}

export function distributeIncome(amount: number): { sponsor: number, monoline: number, company: number } {
  return {
    sponsor: amount * (COMMISSION_RATES.directSponsor / 100),
    monoline: amount * (COMMISSION_RATES.monolinePool / 100),
    company: amount * (COMMISSION_RATES.companyFund / 100),
  };
}
