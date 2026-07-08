import { Router } from "express";
import mongoose, { Schema } from "mongoose";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Define self-contained Broadcast schema & model
interface IBroadcast {
  streamUrl: string;
  title: string;
  description: string;
  platform: string;
  status: 'active' | 'inactive';
  startedAt?: Date;
  endedAt?: Date;
}

const BroadcastSchema = new Schema<IBroadcast>({
  streamUrl: { type: String, required: true },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  platform: { type: String, default: "youtube" },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  startedAt: { type: Date },
  endedAt: { type: Date },
});

const Broadcast = mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);

// GET /api/broadcast/status - Public endpoint to retrieve active broadcast
router.get("/status", async (req, res) => {
  try {
    const active = await Broadcast.findOne({ status: 'active' });
    if (active) {
      res.json({
        success: true,
        status: 'active',
        streamUrl: active.streamUrl,
        title: active.title,
        description: active.description,
        platform: active.platform,
        startedAt: active.startedAt,
        broadcast: active
      });
    } else {
      res.json({
        success: true,
        status: 'inactive',
        streamUrl: null,
        title: null,
        description: null,
        broadcast: null
      });
    }
  } catch (error: any) {
    console.error("Error fetching broadcast status:", error);
    res.status(500).json({ error: "Failed to fetch live broadcast status", details: error.message });
  }
});

// GET /api/broadcast/admin/status - Admin endpoint to check broadcast status
router.get("/admin/status", requireAdmin, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOne().sort({ startedAt: -1 });
    res.json({ success: true, broadcast });
  } catch (error: any) {
    console.error("Error retrieving admin broadcast status:", error);
    res.status(500).json({ error: "Error checking broadcast status", details: error.message });
  }
});

// POST /api/broadcast/admin/start - Start a live stream session
router.post("/admin/start", requireAdmin, async (req, res) => {
  try {
    const { streamUrl, title, description, platform } = req.body;
    
    if (!streamUrl) {
      return res.status(400).json({ success: false, message: "Stream URL is required." });
    }

    // Set other active broadcasts to inactive
    await Broadcast.updateMany({ status: 'active' }, { status: 'inactive', endedAt: new Date() });

    const broadcast = await Broadcast.create({
      streamUrl,
      title: title || "",
      description: description || "",
      platform: platform || "youtube",
      status: 'active',
      startedAt: new Date()
    });

    res.json({
      success: true,
      message: "Canlı yayın başarıyla başlatıldı ve tüm üyelere duyuruldu.",
      broadcast
    });
  } catch (error: any) {
    console.error("Error starting broadcast:", error);
    res.status(500).json({ error: "Failed to start broadcast", details: error.message });
  }
});

// POST /api/broadcast/admin/end - Conclude active live stream session
router.post("/admin/end", requireAdmin, async (req, res) => {
  try {
    await Broadcast.updateMany({ status: 'active' }, { status: 'inactive', endedAt: new Date() });
    const latest = await Broadcast.findOne().sort({ startedAt: -1 });
    
    res.json({
      success: true,
      message: "Canlı yayın başarıyla tamamlandı.",
      broadcast: latest
    });
  } catch (error: any) {
    console.error("Error ending broadcast:", error);
    res.status(500).json({ error: "Failed to end broadcast", details: error.message });
  }
});

export default router;
