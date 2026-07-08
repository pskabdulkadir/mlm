import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, cloneProducts: [] });
});

export default router;
