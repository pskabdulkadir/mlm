import { Router } from "express";
import mongoose, { Schema } from "mongoose";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Define SystemSetting collection schema for arbitrary configuration variables
interface ISystemSetting {
  key: string;
  value: any;
}

const SystemSettingSchema = new Schema<ISystemSetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true }
});

const SystemSetting = mongoose.models.SystemSetting || mongoose.model("SystemSetting", SystemSettingSchema);

// Helper function to safely get or initialize a setting
async function getSetting(key: string, defaultValue: any) {
  try {
    let setting = await SystemSetting.findOne({ key });
    if (!setting) {
      setting = await SystemSetting.create({ key, value: defaultValue });
    }
    return setting.value;
  } catch (error) {
    console.error(`Error in getSetting(${key}):`, error);
    return defaultValue;
  }
}

// Helper function to save a setting
async function saveSetting(key: string, value: any) {
  try {
    await SystemSetting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error(`Error in saveSetting(${key}):`, error);
    return false;
  }
}

// Default Monoline values
const DEFAULT_MONOLINE_SETTINGS = {
  productPrice: 100,
  sponsorCommissionPercent: 25,
  unilevelCommissionPercent: 10,
  poolCommissionPercent: 5,
  companyCommissionPercent: 60
};

// ─── Social Media Links Endpoints ───
router.get("/social-media", async (req, res) => {
  try {
    const defaultLinks = {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      telegram: ""
    };
    const links = await getSetting("social-media", defaultLinks);
    res.json(links);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch social media", details: error.message });
  }
});

router.post("/social-media", requireAdmin, async (req, res) => {
  try {
    const links = req.body;
    await saveSetting("social-media", links);
    res.json({ success: true, links });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save social media", details: error.message });
  }
});

// ─── Promotions Endpoints ───
router.get("/promotions", requireAdmin, async (req, res) => {
  try {
    const promotions = await getSetting("promotions", []);
    res.json({ promotions });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch promotions", details: error.message });
  }
});

router.post("/promotions", requireAdmin, async (req, res) => {
  try {
    const { promotions } = req.body;
    const arrayToSave = Array.isArray(promotions) ? promotions : req.body; // fallback if directly array
    await saveSetting("promotions", arrayToSave);
    res.json({ success: true, promotions: arrayToSave });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save promotions", details: error.message });
  }
});

// ─── Gifts settings Endpoints ───
router.get("/gifts", requireAdmin, async (req, res) => {
  try {
    const defaultGifts = {
      birthdayGiftPercent: 5,
      affiliateBonusPercent: 10
    };
    const settings = await getSetting("gifts", defaultGifts);
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch gifts settings", details: error.message });
  }
});

router.post("/gifts", requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    await saveSetting("gifts", settings);
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save gifts settings", details: error.message });
  }
});

// ─── Monoline structures Endpoints ───
router.get("/monoline", async (req, res) => {
  try {
    const settings = await getSetting("monoline", DEFAULT_MONOLINE_SETTINGS);
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch monoline settings", details: error.message });
  }
});

router.put("/monoline", requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body;
    const settings = updates || req.body;
    await saveSetting("monoline", settings);
    res.json({ success: true, message: "Monoline settings updated successfully", settings });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update monoline settings", details: error.message });
  }
});

// ─── Defaults Reset Endpoint ───
router.post("/reset-to-defaults", requireAdmin, async (req, res) => {
  try {
    await saveSetting("monoline", DEFAULT_MONOLINE_SETTINGS);
    res.json({ success: true, settings: DEFAULT_MONOLINE_SETTINGS });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to reset settings to default", details: error.message });
  }
});

export default router;
