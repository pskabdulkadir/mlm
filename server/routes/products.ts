import { Router, Request, Response } from "express";
import { mongoDb } from "../lib/mongo-database";

const router = Router();

// GET /api/products - Get all active products
router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await mongoDb.getAllProducts();
    return res.json({ success: true, products });
  } catch (error: any) {
    console.error("Error in GET /api/products:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/user/:userId/purchases - Get user's purchases
router.get("/user/:userId/purchases", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const purchases = await mongoDb.getUserProductPurchases(userId);
    return res.json({ success: true, purchases });
  } catch (error: any) {
    console.error("Error in GET /api/products/user/:userId/purchases:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/admin/products - Admin get all products
router.get("/admin/products", async (req: Request, res: Response) => {
  try {
    const products = await mongoDb.adminGetAllProducts();
    return res.json({ success: true, products });
  } catch (error: any) {
    console.error("Error in GET /admin/products:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products/admin/products - Admin create product
router.post("/admin/products", async (req: Request, res: Response) => {
  try {
    const result = await mongoDb.adminCreateProduct(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error("Error in POST /admin/products:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/admin/products/:productId - Admin update product
router.put("/admin/products/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await mongoDb.adminUpdateProduct(productId, req.body);
    return res.json(result);
  } catch (error: any) {
    console.error("Error in PUT /admin/products/:productId:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/admin/products/:productId - Admin delete/deactivate product
router.delete("/admin/products/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await mongoDb.adminDeleteProduct(productId);
    return res.json(result);
  } catch (error: any) {
    console.error("Error in DELETE /admin/products/:productId:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/admin/purchases - Admin get all purchases
router.get("/admin/purchases", async (req: Request, res: Response) => {
  try {
    const purchases = await mongoDb.adminGetAllProductPurchases();
    return res.json({ success: true, purchases });
  } catch (error: any) {
    console.error("Error in GET /admin/purchases:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/admin/purchases/:purchaseId/approve - Admin approve purchase
router.put("/admin/purchases/:purchaseId/approve", async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;
    const adminId = "ADMIN001"; // Default mockup admin ID
    
    // Update purchase status
    await mongoDb.updateProductPurchase(purchaseId, { status: "approved", approvedAt: new Date(), approvedBy: adminId });
    
    // Distribute commission sponsor bonus
    await mongoDb.distributeProductCommissions(purchaseId);

    // Fetch the purchase to find the user
    const purchase = await mongoDb.getProductPurchaseById(purchaseId);
    if (purchase) {
      // Activate the user immediately upon purchase approval
      await mongoDb.updateUser(purchase.userId, { isActive: true });

      try {
        // Release held commissions for users who became eligible
        const { MonolineCommissionService } = await import("../lib/monoline-commission-service");
        await MonolineCommissionService.releaseHeldCommissionsForEligibleUsers();
      } catch (err) {
        console.error("Error releasing commissions on admin approval:", err);
      }

      try {
        // Clear caches
        const { getCacheManager } = await import("../config/cache.config");
        const cache = await getCacheManager();
        await cache.delete(`user:eligibility:${purchase.userId}`);
        await cache.delete(`user:challenges:${purchase.userId}`);
      } catch (err) {
        console.error("Error clearing caches on admin approval:", err);
      }
    }
    
    return res.json({ success: true, message: "Sipariş başarıyla onaylandı ve komisyonlar dağıtıldı." });
  } catch (error: any) {
    console.error("Error in PUT approve purchase:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/admin/purchases/:purchaseId/reject - Admin reject purchase
router.put("/admin/purchases/:purchaseId/reject", async (req: Request, res: Response) => {
  try {
    const { purchaseId } = req.params;
    const adminId = "ADMIN001";
    
    await mongoDb.updateProductPurchase(purchaseId, { status: "rejected", rejectedAt: new Date(), rejectedBy: adminId });
    
    return res.json({ success: true, message: "Sipariş başarıyla reddedildi." });
  } catch (error: any) {
    console.error("Error in PUT reject purchase:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:productId - Get product by ID
router.get("/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    // If dynamic ID looks like prod-xxxxx, query DB
    let product = await mongoDb.getProductById(productId);
    
    // Fallback: If not found, look up by name/slug match (e.g. "yearly-active-pack" -> "Yıllık Aktiflik Paketi")
    if (!product) {
      const all = await mongoDb.getAllProducts();
      product = all.find((p: any) => 
        p.id === productId || 
        p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === productId ||
        p.name.toLowerCase().includes(productId.split("-")[0])
      ) || null;
    }
    
    if (product) {
      return res.json({ success: true, product });
    } else {
      return res.status(404).json({ success: false, error: "Ürün bulunamadı." });
    }
  } catch (error: any) {
    console.error("Error in GET /api/products/:productId:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products/purchase - Create product purchase (Secure Checkout)
router.post("/purchase", async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      buyerId, 
      buyerEmail, 
      productId, 
      totalAmount, 
      referralCode, 
      paymentMethod, 
      shippingAddress, 
      shippingOption 
    } = req.body;
    const finalUserId = userId || buyerId;
    
    if (!finalUserId || !productId) {
      return res.status(400).json({ success: false, error: "Kullanıcı ID ve Ürün ID zorunludur." });
    }

    if (paymentMethod === "wallet") {
      // 1. Get user and verify wallet balance
      const user = await mongoDb.getUserById(finalUserId);
      if (!user) {
        return res.status(404).json({ success: false, error: "Kullanıcı bulunamadı." });
      }

      const balance = user.wallet?.balance || 0;
      const amountToPay = Number(totalAmount) || 0;

      if (balance < amountToPay) {
        return res.status(400).json({ 
          success: false, 
          error: `Yetersiz bakiye. Mevcut bakiyeniz: $${balance.toFixed(2)}, Gereken tutar: $${amountToPay.toFixed(2)}` 
        });
      }

      // 2. Deduct from wallet using applyWalletTransactions
      const { applyWalletTransactions } = await import("../lib/wallet-transaction.service");
      const deductionTx = {
        userId: finalUserId,
        amount: amountToPay,
        type: "SHOPPING",
        reference: `SHOP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        description: `Cüzdan Bakiyesi ile Ürün Alımı (ID: ${productId})`,
        status: "PAID"
      };

      const deductionSuccess = await applyWalletTransactions([deductionTx]);
      if (!deductionSuccess) {
        return res.status(500).json({ success: false, error: "Ödeme işlemi gerçekleştirilemedi (Cüzdan hatası)." });
      }

      // 3. Fulfill the purchase immediately
      const { fulfillProductPurchase } = await import("../lib/purchase-fulfillment");
      const fulfillmentResult = await fulfillProductPurchase({
        productId,
        buyerEmail: buyerEmail || user.email,
        referralCode: referralCode || user.referralCode || "ak000001",
        shippingAddress: shippingAddress || {},
        paymentMethod: "wallet",
        totalAmount: amountToPay,
        userId: finalUserId
      });

      if (!fulfillmentResult.success) {
        return res.status(400).json({ 
          success: false, 
          error: fulfillmentResult.error || "Fulfillment işlemi başarısız oldu." 
        });
      }

      return res.json({
        success: true,
        message: "Cüzdan bakiyesi ile satın alım başarıyla tamamlandı!",
        purchase: fulfillmentResult.purchase || { productId, totalAmount: amountToPay }
      });
    }

    const result = await mongoDb.createProductPurchase({
      userId: finalUserId,
      productId,
      totalAmount: totalAmount || 0,
      referralCode: referralCode || "ak000001",
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/products/purchase:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
