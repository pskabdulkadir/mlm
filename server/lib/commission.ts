// ============================================================
//  AKN GROUP — Komisyon Sabitleri (v2 — Dinamik)
//  Kaynak: shared/mlmRules.ts'deki oranlar buraya yansıtılır.
// ============================================================

import { UNILEVEL_RATES, MAX_UNILEVEL_DEPTH } from '../../shared/mlmRules';

/**
 * 7 seviye Unilevel komisyon tablosu.
 * Toplam = %10 (L1:3 + L2:2 + L3:1.5 + L4:1.5 + L5:1 + L6:0.5 + L7:0.5)
 */
export const MONOLINE_LEVEL_COMMISSIONS = Array.from(
  { length: MAX_UNILEVEL_DEPTH },
  (_, i) => ({
    level:   i + 1,
    percent: UNILEVEL_RATES[i + 1] ?? 0,
  })
);

/**
 * Monoline derinlik arama limitinin üst sınırı.
 * İnsan-ı Kamil = 999999 (sonsuz), tarama döngüsünü kısıtlamak için 500 kullanılır.
 */
export const MAX_MONOLINE_LEVEL = 500;

/** Direkt sponsor prim oranı */
export const DIRECT_SPONSOR_RATE = 25; // %25

/** Şirket fonu oranı */
export const COMPANY_FUND_RATE = 50; // %50

/** Monoline havuz oranı */
export const MONOLINE_POOL_RATE = 10; // %10

/** Unilevel toplam oranı */
export const UNILEVEL_TOTAL_RATE = 15; // %15
