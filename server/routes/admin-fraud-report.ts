import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, alerts: [] });
});

export default router;
