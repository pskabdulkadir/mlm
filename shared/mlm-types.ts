export interface PointsSystem {
  personalSalesPoints: number;
  teamSalesPoints: number;
  directReferrals: number;
  minimumMonthlyPoints: number;
  registrationPoints: number;
  totalPoints: number;
  monthlyPoints: number;
  lastPointUpdate?: Date;
}

export interface Wallet {
  balance: number;
  totalEarnings: number;
  sponsorBonus: number;
  careerBonus: number;
  passiveIncome: number;
  leadershipBonus: number;
}

export interface CareerLevel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  minInvestment?: number;
  minDirectReferrals?: number;
  requiredUSD?: number;
  requiredTeamCiroTL?: number;
  requiredActivePeople?: number;
  requiredDirectReferrals?: number;
  maxLegContributionPercent?: number;
  personalSalesPoints?: number;
  teamSalesPoints?: number;
  commissionRate?: number;
  order?: number;
  isActive?: boolean;
  level?: number;
  monolineDepthLimit?: number;
  passiveIncomeRate?: number;
  bonus?: number;
  requirements?: {
    personalSalesPoints: number;
    teamSalesPoints: number;
    directReferrals: number;
    minimumMonthlyPoints: number;
  };
  benefits?: {
    directSalesCommission: number;
    teamBonusRate: number;
    monthlyBonus: number;
    rankBonus: number;
    monolineDepthLimit?: number;
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: "admin" | "user" | "moderator" | "member" | "leader" | "visitor";
  membershipType: "entry" | "monthly" | "yearly" | "free" | "standard" | "elite" | "vip" | "premium" | "NONE";
  membershipStartDate?: Date;
  pointsSystem?: PointsSystem;
  careerLevel: CareerLevel | string;
  cloneStoreEnabled?: boolean;
  cloneStoreName?: string;
  cloneStoreDescription?: string;
  cloneStoreTheme?: string;
  previousUserId?: string;
  globalRank?: number;
  sponsorId?: string;
  isActive: boolean;
  wallet: Wallet;
  kycStatus: "pending" | "approved" | "rejected";
  twoFactorEnabled?: boolean;
  memberId?: string;
  lastActivityDate?: Date;
  monthlyActivityStreak?: number;
  yearlyRenewalDate?: Date;
  nextRenewalWarning?: Date;
  monthlyActivityStatus?: "active" | "inactive" | "warning";
  totalInvestment?: number;
  totalTeamCiroTL?: number;
  legCirosTL?: Map<string, number> | Record<string, number>;
  directReferrals?: number;
  totalTeamSize?: number;
  monthlySalesVolume?: number;
  annualSalesVolume?: number;
  referralCode: string;
  lastLoginDate?: Date;
  lastPaymentDate?: Date;
  receiptFile?: string;
  receiptUploadedAt?: Date;
  receiptVerified?: boolean;
  membershipEndDate?: Date;
  registrationDate?: Date;
  daysSinceLastActivity?: number;
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  teamTurnoverUSD?: number;
  career_level?: number;
  total_team_ciro?: number;
  direct_references?: number;
}

export interface MembershipPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  type: "entry" | "monthly" | "yearly";
  features?: string[];
  currency?: string;
  bonusPercentage?: number;
  commissionRate?: number;
}

export interface PendingPlacement {
  id: string;
  userId: string;
  sponsorId: string;
  parentPlacementId?: string;
  position?: "left" | "right";
  expiresAt: Date;
  createdAt: Date;
}

export interface MonolineMLMSettings {
  isActive: boolean;
  maxLevels: number;
  globalCommissionRate: number;
}

export interface MonolineCommissionStructure {
  level: number;
  rate: number;
}

export interface MonolineCommissionTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
}

export interface PassiveIncomeDistribution {
  id: string;
  userId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  date: string | Date;
  referenceId?: string;
  adminNote?: string;
  timestamp?: Date;
}
