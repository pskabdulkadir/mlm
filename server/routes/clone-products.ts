import { Router, Request, Response } from "express";
import { mongoDb } from "../lib/mongo-database";

const router = Router();

// GET /api/clone-products - Get all clone products
router.get("/", (req, res) => {
  res.json({ success: true, cloneProducts: [] });
});

// GET /api/clone-products/:memberId - Get clone page data with products
router.get("/:memberId", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    // Fetch member user
    const member = await mongoDb.getUserById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, error: "Üye bulunamadı" });
    }

    // Fetch all active products
    const products = await mongoDb.getAllProducts();
    const activeProducts = products.filter((p: any) => p.isActive !== false);

    // Fetch clone page stats
    const clonePage = await mongoDb.getUserCloneStoreData(memberId);
    const stats = {
      visits: clonePage?.visitCount || 0,
      purchases: clonePage?.conversionCount || 0,
      totalCommissions: 0, // Can be calculated from purchase history
    };

    return res.json({
      success: true,
      member: {
        id: member.id,
        memberId: member.memberId || member.id,
        fullName: member.fullName,
        referralCode: member.referralCode,
        careerLevel: member.careerLevel || { name: "Başlangıç", commissionRate: 0 },
      },
      products: activeProducts,
      cloneStats: stats,
    });
  } catch (error: any) {
    console.error("Error in GET /api/clone-products/:memberId:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clone-products/:memberId/visit - Track visit
router.post("/:memberId/visit", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    // Update visit count
    const clonePage = await mongoDb.getUserCloneStoreData(memberId);
    if (clonePage) {
      const updated = await mongoDb.updateUserCloneStore(memberId, {
        visitCount: (clonePage.visitCount || 0) + 1,
      });
      return res.json({ success: true, visitCount: updated?.visitCount || 0 });
    }

    return res.status(404).json({ success: false, error: "Clone sayfa bulunamadı" });
  } catch (error: any) {
    console.error("Error in POST /api/clone-products/:memberId/visit:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clone-products/:memberId/stats - Get clone page stats
router.get("/:memberId/stats", async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    const clonePage = await mongoDb.getUserCloneStoreData(memberId);
    if (!clonePage) {
      return res.status(404).json({ success: false, error: "Clone sayfa bulunamadı" });
    }

    return res.json({
      success: true,
      stats: {
        visits: clonePage.visitCount || 0,
        conversions: clonePage.conversionCount || 0,
        conversionRate: clonePage.visitCount
          ? (((clonePage.conversionCount || 0) / clonePage.visitCount) * 100).toFixed(2)
          : "0",
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/clone-products/:memberId/stats:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clone-products/purchase - Process clone page purchase
router.post("/purchase", async (req: Request, res: Response) => {
  try {
    const {
      productId,
      buyerEmail,
      referralCode,
      clonePageMemberId,
      cloneCommissionAmount,
      purchaseAmount,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!productId || !clonePageMemberId) {
      return res.status(400).json({ success: false, error: "Ürün ID ve member ID zorunludur" });
    }

    // Create product purchase record
    const purchase = await mongoDb.createProductPurchase({
      userId: clonePageMemberId,
      productId,
      totalAmount: purchaseAmount || 0,
      referralCode: referralCode || "ak000001",
    });

    if (!purchase.success) {
      return res.status(400).json({ success: false, error: purchase.error });
    }

    // Update clone page conversion count
    const clonePage = await mongoDb.getUserCloneStoreData(clonePageMemberId);
    if (clonePage) {
      await mongoDb.updateUserCloneStore(clonePageMemberId, {
        conversionCount: (clonePage.conversionCount || 0) + 1,
      });
    }

    return res.json({
      success: true,
      message: "Satın alım başarıyla kaydedildi",
      purchase: purchase.purchase,
    });
  } catch (error: any) {
    console.error("Error in POST /api/clone-products/purchase:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
