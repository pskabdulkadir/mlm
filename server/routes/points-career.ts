import { Router } from "express";
import { mongoDb } from "../lib/mongo-database";
import { User } from "../lib/models";
import { PointsCareerService } from "../lib/points-career-service";
import { applyWalletTransactions } from "../lib/wallet-transaction.service";

const router = Router();

// GET /api/points-career/career-levels - Retrieve career levels list
router.get("/career-levels", async (req, res) => {
  try {
    const careerLevels = await mongoDb.getCareerLevels();
    res.json({ careerLevels });
  } catch (error: any) {
    console.error("Error fetching career levels:", error);
    res.status(500).json({ error: "Failed to fetch career levels", details: error.message });
  }
});

// POST /api/points-career/admin/career-levels - Create new career level
router.post("/admin/career-levels", async (req, res) => {
  try {
    const levelData = req.body;
    if (!levelData.id) {
      levelData.id = levelData.name.toLowerCase().replace(/\s+/g, '-').replace(/İ/g, 'i');
    }
    const saved = await mongoDb.saveCareerLevel(levelData);
    res.json({ success: true, careerLevel: saved });
  } catch (error: any) {
    console.error("Error creating career level:", error);
    res.status(500).json({ error: "Failed to create career level", details: error.message });
  }
});

// PUT /api/points-career/admin/career-levels/:id - Update career level
router.put("/admin/career-levels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const levelData = { ...updates, id };
    const saved = await mongoDb.saveCareerLevel(levelData);
    res.json({ success: true, careerLevel: saved });
  } catch (error: any) {
    console.error("Error updating career level:", error);
    res.status(500).json({ error: "Failed to update career level", details: error.message });
  }
});

// DELETE /api/points-career/admin/career-levels/:id - Delete career level
router.delete("/admin/career-levels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mongoDb.deleteCareerLevel(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting career level:", error);
    res.status(500).json({ error: "Failed to delete career level", details: error.message });
  }
});

// GET /api/points-career/admin/leaderboard - Get leaderboard sorted by points
router.get("/admin/leaderboard", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const sorted = users.map((u: any) => {
      const totalPoints = u.pointsSystem?.totalPoints || u.totalPoints || 0;
      return {
        id: u.id,
        fullName: u.fullName,
        memberId: u.memberId,
        totalPoints,
      };
    }).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    res.json({
      leaderboard: sorted,
      totalUsers: sorted.length
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard", details: error.message });
  }
});

// POST /api/points-career/calculate-bonuses - Calculate and distribute monthly bonuses
router.post("/calculate-bonuses", async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const careerLevels = await mongoDb.getCareerLevels();
    
    let usersWithBonuses = 0;
    let totalBonusesDistributed = 0;

    const txsToApply: any[] = [];

    for (const user of users) {
      const bonusInfo = PointsCareerService.calculateCareerBonuses(user as any, careerLevels);
      const totalBonus = (bonusInfo.monthlyBonus || 0) + (bonusInfo.rankBonus || 0);

      if (totalBonus > 0) {
        usersWithBonuses++;
        totalBonusesDistributed += totalBonus;

        txsToApply.push({
          userId: user.id,
          amount: totalBonus,
          type: "CAREER",
          reference: `BONUS-${Date.now()}-${user.id}`,
          description: `Aylık Kariyer ve Seviye Bonusu Dağıtımı (${(user.careerLevel as any)?.displayName || user.careerLevel || 'Mülhime'})`,
          sourceUserId: "SYSTEM",
          status: "PAID"
        });
      }
    }

    if (txsToApply.length > 0) {
      await applyWalletTransactions(txsToApply);
    }

    const averageBonus = usersWithBonuses > 0 ? (totalBonusesDistributed / usersWithBonuses) : 0;

    res.json({
      usersWithBonuses,
      totalBonusesDistributed,
      averageBonus
    });
  } catch (error: any) {
    console.error("Error calculating bonuses:", error);
    res.status(500).json({ error: "Failed to calculate bonuses", details: error.message });
  }
});

router.get("/", (req, res) => {
  res.json({ success: true, points: 0 });
});

export default router;
