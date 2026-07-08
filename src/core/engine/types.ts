/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Big from "big.js";

export interface UserNode {
  id: string;
  name: string;
  username: string;
  email: string;
  // Hierarchical relations
  parent_id: string | null;      // General parent (sponsor)
  upline_id: string | null;      // Direct line sponsor/upline
  
  // Stats
  joined_at: string;
  personal_pv: number;           // Personal Point Value
  
  // Career-specific stats (Nefis Mertebeleri)
  career_level: number;          // 1 to 10
  direct_references: number;     // number of directly sponsored accounts
  total_team_ciro: number;       // cumulative unilevel team sales volume in USD

  // DEPRECATED - DEAD CODE BY CONSTITUTION (Sol ve Sağ Kollar, Denge Primi yasaktır)
  left_child_id?: string | null;
  right_child_id?: string | null;
  position?: "LEFT" | "RIGHT" | null;
  group_pv_left?: number;
  group_pv_right?: number;
}

export interface CareerLevelConfig {
  level: number;
  name: string;
  minDirectRefs: number;
  minTeamCiro: number;
  monolineDepthLimit: number; // Max rows they can earn monoline from (e.g. 10, 20, ..., Infinity)
}

export interface PointsLogEntry {
  id: string;
  sale_id: string;
  user_id: string;
  amount: number;                // Sale amount in currency
  pv_amount: number;             // PV (Point Value) for commissions
  product_name: string;
  timestamp: string;
}

export interface PayoutHistoryEntry {
  id: string;
  sale_id: string;
  user_id: string;
  amount: number;
  currency: string;
  model_type: "BINARY" | "UNILEVEL" | "MATRIX" | "MONOLINE";
  rule_details: string;          // Description of calculation (e.g., "10% Weak Leg matching 800 PV")
  timestamp: string;
}

// Closure Table entry for unlimited depth hierarchy management
export interface ClosureEntry {
  ancestor_id: string;
  descendant_id: string;
  depth: number;
}

// Dynamic Formula Configurations
export interface FormulaConfig {
  BINARY_MATCHING_RATE: number; // default: 0.10 (10%)
  UNILEVEL_LV1_RATE: number;     // default: 0.10 (10%)
  UNILEVEL_LV2_RATE: number;     // default: 0.05 (5%)
  UNILEVEL_LV3_RATE: number;     // default: 0.03 (3%)
  UNILEVEL_LV4_RATE: number;     // default: 0.02 (2%)
  UNILEVEL_LV5_RATE: number;     // default: 0.01 (1%)
  MATRIX_FLAT_RATE: number;      // default: 0.04 (4%)
  MONOLINE_LEVEL_RATE: number;   // default: 0.02 (2%)

  // Nefis Mertebeleri 10-Level Career Dynamic Rates
  DIRECT_SPONSOR_RATE: number;   // default: 0.25 (25%)
  UNILEVEL_L1_RATE: number;      // default: 0.03 (3%)
  UNILEVEL_L2_RATE: number;      // default: 0.02 (2%)
  UNILEVEL_L3_RATE: number;      // default: 0.015 (1.5%)
  UNILEVEL_L4_RATE: number;      // default: 0.015 (1.5%)
  UNILEVEL_L5_RATE: number;      // default: 0.01 (1.0%)
  UNILEVEL_L6_RATE: number;      // default: 0.005 (0.5%)
  UNILEVEL_L7_RATE: number;      // default: 0.005 (0.5%)
  MONOLINE_POOL_RATE: number;    // default: 0.05 (5%)
}

// Transaction simulation log entry
export interface TransactionStepLog {
  timestamp: string;
  type: "INFO" | "LOCK_ACQUIRED" | "CALCULATING" | "LEDGER_UPDATE" | "COMMIT" | "ROLLBACK";
  message: string;
}

// Stateless Engine Inputs
export interface PayoutRequestPayload {
  sale_id: string;
  user_id: string;               // User who made the purchase
  amount?: number;               // Purchase amount (e.g. USD) - Optional when product_id is provided
  pv_amount?: number;            // Point value for calculation (e.g. 100 PV) - Optional when product_id is provided
  product_id?: string;           // Optional ID of the product for dynamic fetching from ProductService
  model_type: "unilevel" | "matrix" | "monoline" | "binary"; // "binary" remains for legacy route compatibility but is disabled at runtime
  product_name?: string;
  apiKey: string;
}

export interface PayoutCalculationResult {
  user_id: string;
  amount: number;
  type: string;
  rule_details: string;
}

export interface PayoutEngineResponse {
  status: "success" | "error";
  sale_id: string;
  payouts: PayoutCalculationResult[];
  transaction_logs?: TransactionStepLog[];
  error?: string;
}

// Strategy Pattern Interface updated with Closure Table and FormulaResolver support
export interface PayoutStrategy {
  calculate(
    payload: {
      sale_id: string;
      user_id: string;
      pv_amount: number;
      amount: number;
    },
    users: Map<string, UserNode>,
    closures: ClosureEntry[],
    config: FormulaConfig
  ): PayoutCalculationResult[];
}
