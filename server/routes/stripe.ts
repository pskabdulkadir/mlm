import { Router } from "express";
import { fulfillProductPurchase } from "../lib/purchase-fulfillment";

const router = Router();

router.post("/create-checkout-session", (req, res) => {
  try {
    const { productId, buyerEmail, metadata } = req.body;
    const referralCode = metadata?.referralCode || "";
    const shippingAddress = metadata?.shippingAddress || "{}",
      shippingOption = metadata?.shippingOption || "",
      userId = metadata?.userId || "";

    const queryParams = new URLSearchParams({
      productId: productId || "",
      buyerEmail: buyerEmail || "",
      referralCode: referralCode || "",
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
      shippingOption: shippingOption || "",
      userId: userId || ""
    });

    res.json({ 
      success: true, 
      sessionId: "mock_" + Date.now(), 
      url: `/checkout-simulation?${queryParams.toString()}` 
    });
  } catch (error: any) {
    console.error("Error in create-checkout-session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/complete", async (req, res) => {
  try {
    const { productId, buyerEmail, referralCode, shippingAddress, shippingOption, userId } = req.body;
    
    let parsedAddress = {};
    if (shippingAddress) {
      try {
        parsedAddress = typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress;
      } catch (e) {
        parsedAddress = { raw: shippingAddress };
      }
    }

    const result = await fulfillProductPurchase({
      productId,
      buyerEmail,
      referralCode,
      shippingAddress: parsedAddress,
      paymentMethod: "stripe_mock",
      userId: userId || undefined
    });

    if (result.success) {
      res.json({ success: true, purchaseId: result.purchaseId });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error("Error completing Stripe mock session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
