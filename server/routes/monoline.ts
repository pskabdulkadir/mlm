import { Router } from "express";
import { User, ProductPurchase } from "../lib/models";
import { mongoDb } from "../lib/mongo-database";
import { MonolineCommissionService } from "../lib/monoline-commission-service";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, monoline: {} });
});

router.get("/stats", async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({});
    const activeMembers = await User.countDocuments({ isActive: true });
    
    // Total Sales and Average
    const purchases = await ProductPurchase.find({ status: "approved" });
    const totalSales = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const averageSalesPerMember = totalMembers > 0 ? (totalSales / totalMembers) : 0;
    
    // Passive Income Pool Amount
    const passivePoolAmount = await mongoDb.getPassiveIncomePoolAmount();

    return res.json({
      success: true,
      network: {
        totalMembers,
        activeMembers,
        totalSales,
        averageSalesPerMember
      },
      funds: {
        passiveIncomePool: passivePoolAmount
      }
    });
  } catch (error: any) {
    console.error("Error in /api/monoline/stats:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/admin/test-commission", async (req, res) => {
  try {
    const { buyerId, productPrice } = req.body;
    const calc = await MonolineCommissionService.calculateMonolineCommissions(
      buyerId || "admin-001",
      productPrice || 100
    );
    
    const totalCommissions = `$${calc.totalDistributed.toFixed(2)} USD`;
    const directSponsor = `Direkt Sponsor Primi: $${(productPrice * 0.1).toFixed(2)} USD`;
    const careerBonuses = `Kariyer Primi: $${(calc.totalDistributed - (productPrice * 0.1)).toFixed(2)} USD`;
    const passivePool = `$${calc.passivePoolAmount.toFixed(2)} USD`;
    const companyFund = `$${calc.companyFundAmount.toFixed(2)} USD`;

    return res.json({
      success: true,
      breakdown: {
        totalCommissions,
        directSponsor,
        careerBonuses,
        passivePool,
        companyFund
      }
    });
  } catch (error: any) {
    console.error("Error in test-commission:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
