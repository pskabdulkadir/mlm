import { DistributionLock } from "../models";

export class DistributionLockService {
  private static LOCK_NAME = "passive_income_distribution";
  private static DEFAULT_TTL_MS = 60000; // 1 minute default TTL

  /**
   * Acquire lock for passive income distribution
   */
  static async acquirePassiveDistributionLock(
    instanceId: string,
    ttlMs: number = this.DEFAULT_TTL_MS
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttlMs);

      // Find if there is an existing lock
      let lock = await DistributionLock.findOne({ lockName: this.LOCK_NAME });

      if (!lock) {
        // Create first lock
        try {
          lock = await DistributionLock.create({
            lockName: this.LOCK_NAME,
            lockedBy: instanceId,
            isLocked: true,
            lockedAt: now,
            expiresAt: expiresAt,
          });
          return { success: true, message: "Lock created and acquired successfully." };
        } catch (createErr: any) {
          // If duplicate key race condition happened, retrieve it
          lock = await DistributionLock.findOne({ lockName: this.LOCK_NAME });
        }
      }

      if (lock) {
        // Check if locked and not expired
        const isExpired = lock.expiresAt && lock.expiresAt.getTime() < now.getTime();

        if (!lock.isLocked || isExpired) {
          // Acquire lock
          const res = await DistributionLock.updateOne(
            { 
              lockName: this.LOCK_NAME,
              $or: [
                { isLocked: false },
                { expiresAt: { $lt: now } }
              ]
            },
            {
              $set: {
                lockedBy: instanceId,
                isLocked: true,
                lockedAt: now,
                expiresAt: expiresAt,
              }
            }
          );

          if (res.modifiedCount > 0) {
            return { success: true, message: "Lock acquired successfully." };
          }
        } else if (lock.lockedBy === instanceId) {
          // Re-acquire / extend TTL
          await DistributionLock.updateOne(
            { lockName: this.LOCK_NAME },
            { $set: { expiresAt: expiresAt } }
          );
          return { success: true, message: "Lock TTL extended." };
        }
      }

      return {
        success: false,
        message: `Lock is already held by instance: ${lock?.lockedBy || "unknown"}`
      };
    } catch (error: any) {
      console.error("Error acquiring lock:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Release lock
   */
  static async releasePassiveDistributionLock(
    instanceId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const lock = await DistributionLock.findOne({ lockName: this.LOCK_NAME });
      if (!lock || !lock.isLocked) {
        return { success: false, message: "Lock is not active." };
      }

      if (lock.lockedBy !== instanceId) {
        return {
          success: false,
          message: `Cannot release lock. Held by: ${lock.lockedBy}, attempt by: ${instanceId}`
        };
      }

      const res = await DistributionLock.updateOne(
        { lockName: this.LOCK_NAME, lockedBy: instanceId },
        {
          $set: {
            isLocked: false,
            lockedBy: null,
            expiresAt: null
          }
        }
      );

      if (res.modifiedCount > 0) {
        return { success: true, message: "Lock released successfully." };
      }

      return { success: false, message: "Failed to release lock." };
    } catch (error: any) {
      console.error("Error releasing lock:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get lock status
   */
  static async getPassiveDistributionLockStatus(): Promise<{
    isLocked: boolean;
    lockedBy: string | null;
  }> {
    try {
      const lock = await DistributionLock.findOne({ lockName: this.LOCK_NAME });
      if (!lock) {
        return { isLocked: false, lockedBy: null };
      }

      const now = Date.now();
      const isExpired = lock.expiresAt && lock.expiresAt.getTime() < now;

      if (lock.isLocked && !isExpired) {
        return { isLocked: true, lockedBy: lock.lockedBy };
      }

      return { isLocked: false, lockedBy: null };
    } catch (error) {
      console.error("Error getting lock status:", error);
      return { isLocked: false, lockedBy: null };
    }
  }
}
