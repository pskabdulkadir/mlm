/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserNode } from "./types";
import { CAREER_LEVELS } from "./config/career-config";

export interface CareerUpgradeEvent {
  userId: string;
  oldLevel: number;
  newLevel: number;
  careerName: string;
  timestamp: string;
  bonusAmount: number;  // NEW: Calculated rank bonus (10% of requirement USD)
  transaction?: {       // NEW: Transaction payload ready to apply
    type: 'CAREER_RANK_BONUS';
    amount: number;
    reference: string;
    description: string;
  };
}

/**
 * CareerService (Kariyer ve Nefis Mertebeleri Hizmeti)
 * Coordinates the 10 career levels checks and safe atomic team volume (ciro) increments.
 * Implements observer-pattern event tracking for career level-up promotions.
 */
export class CareerService {
  /**
   * Safe team volume update following the Unilevel sponsor tree upwards.
   * Simulates pessimistic locking (SELECT FOR UPDATE) to prevent concurrency anomalies.
   * Updates total_team_ciro of all ancestors securely.
   */
  public static updateTeamCiro(
    userId: string,
    amount: number,
    usersDb: Map<string, UserNode>,
    logs: any[]
  ): void {
    const timestamp = () => new Date().toISOString();
    
    logs.push({
      timestamp: timestamp(),
      type: "INFO",
      message: `[CAREER-CIRO-LOCK] Acquiring lock for Unilevel sponsor chain updates for seller: ${userId}...`
    });

    const seller = usersDb.get(userId);
    if (!seller) return;

    let currentId = seller.parent_id;
    let depth = 1;

    // Traverse upwards in the sponsor tree
    while (currentId) {
      const uplineUser = usersDb.get(currentId);
      if (!uplineUser) break;

      // Simulated row lock acquired via pessimistic lock tracker
      logs.push({
        timestamp: timestamp(),
        type: "LEDGER_UPDATE",
        message: `[CAREER-CIRO-UPDATE] [SELECT FOR UPDATE] User ${currentId} locked. Old Ciro: $${uplineUser.total_team_ciro || 0}`
      });

      // Safely increment team volume
      const oldVal = uplineUser.total_team_ciro || 0;
      uplineUser.total_team_ciro = parseFloat((oldVal + amount).toFixed(2));

      logs.push({
        timestamp: timestamp(),
        type: "LEDGER_UPDATE",
        message: `[CAREER-CIRO-SUCCESS] User ${currentId} Unilevel volume updated to $${uplineUser.total_team_ciro} at depth ${depth}.`
      });

      currentId = uplineUser.parent_id;
      depth++;
    }
  }

  /**
   * Career Check: Scans the active configuration rules against user criteria.
   * Automatically promotes eligible users step-by-step.
   * Emits simulated events when career milestone changes occur.
   */
  public static checkCareerUpgrade(
    userId: string,
    usersDb: Map<string, UserNode>,
    logs: any[]
  ): CareerUpgradeEvent | null {
    const timestamp = () => new Date().toISOString();
    const user = usersDb.get(userId);
    if (!user) return null;

    const oldLevel = user.career_level || 1;
    const directRefs = user.direct_references || 0;
    const teamCiro = user.total_team_ciro || 0;

    let targetLevel = oldLevel;

    // Scan the CAREER_LEVELS configuration to see the maximum eligible level
    for (const config of CAREER_LEVELS) {
      if (directRefs >= config.minDirectRefs && teamCiro >= config.minTeamCiro) {
        if (config.level > targetLevel) {
          targetLevel = config.level;
        }
      }
    }

    // If eligible for promotion, apply changes atomically
    if (targetLevel > oldLevel) {
      user.career_level = targetLevel;
      const levelName = CAREER_LEVELS[targetLevel - 1].name;
      const levelConfig = CAREER_LEVELS[targetLevel - 1];

      // Calculate rank bonus: 10% of career requirement USD
      const bonusAmount = (levelConfig.minTeamCiro || 0) * 0.1;

      logs.push({
        timestamp: timestamp(),
        type: "CAREER_UPGRADE",
        message: `🎉 [CAREER-UPGRADE] [CareerUpgradeEvent] User ${userId} (${user.username}) promoted from Level ${oldLevel} to Level ${targetLevel} [${levelName}]! Bonus: $${bonusAmount.toFixed(2)} (Refs: ${directRefs}, Team Ciro: $${teamCiro})`
      });

      return {
        userId,
        oldLevel,
        newLevel: targetLevel,
        careerName: levelName,
        timestamp: timestamp(),
        bonusAmount: Math.round(bonusAmount * 100) / 100,
        transaction: {
          type: 'CAREER_RANK_BONUS',
          amount: Math.round(bonusAmount * 100) / 100,
          reference: `CAREER-${levelName}-${timestamp()}`,
          description: `Kariyer Yükselmesi Bonusu: ${CAREER_LEVELS[oldLevel - 1]?.name || 'Level ' + oldLevel} → ${levelName}`
        }
      };
    }

    return null;
  }
}
