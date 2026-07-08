import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, rates: { BTC: 65000, ETH: 3500 } });
});

export default router;
