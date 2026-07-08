import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { ZoomTraining, Notification, User } from "../lib/models";
import { verifyAccessToken } from "../lib/utils";

const router = Router();

// Helper to extract logged-in user's ID
function getUserIdFromRequest(req: any): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    return decoded ? decoded.id || decoded.userId || null : null;
  } catch (err) {
    return null;
  }
}

// ─── Notification Export Helpers ───
export async function createUserNotification(
  userId: string,
  title: string,
  message?: string,
  type?: string,
  data?: any
) {
  try {
    const notification = await Notification.create({
      id: "notif_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      userId,
      title,
      message: message || "",
      type: type || "system",
      data: data || {},
      isRead: false,
      createdAt: new Date()
    });
    return notification;
  } catch (error) {
    console.error("Error creating user notification:", error);
    return null;
  }
}

export async function broadcastNotification(
  type: string,
  title?: string,
  message?: string,
  data?: any
) {
  try {
    const users = await User.find({}, { id: 1 }).lean();
    const notificationsToCreate = users.map(user => ({
      id: "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000000),
      userId: user.id,
      title: title || "Sistem Duyurusu",
      message: message || "",
      type: type || "system",
      data: data || {},
      isRead: false,
      createdAt: new Date()
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
    return true;
  } catch (error) {
    console.error("Error in broadcastNotification:", error);
    return false;
  }
}

// ─── Member Notification Endpoints ───
router.get("/notifications/mine", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized access." });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    console.error("Error loading mine notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/notifications/read-all", async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized access." });
    }

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error marking notifications read:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Member Upcoming Trainings ───
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trainings = await ZoomTraining.find({
      scheduledAt: { $gte: today },
      isActive: true
    }).sort({ scheduledAt: 1 });

    res.json({ success: true, trainings });
  } catch (error: any) {
    console.error("Error loading upcoming trainings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Admin Zoom Training Endpoints ───
router.get("/", requireAdmin, async (req, res) => {
  try {
    const trainings = await ZoomTraining.find({}).sort({ scheduledAt: -1 });
    res.json({ success: true, trainings });
  } catch (error: any) {
    console.error("Error listing zoom trainings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, description, zoomLink, meetingId, password, scheduledAt, duration } = req.body;
    
    if (!title || !zoomLink || !scheduledAt) {
      return res.status(400).json({ success: false, error: "Lütfen başlık, zoom linki ve planlanan tarihi girin." });
    }

    const training = await ZoomTraining.create({
      id: "zoom_" + Date.now(),
      title,
      description,
      zoomLink,
      meetingId,
      password,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      isActive: true,
      notificationSent: false,
      authorizedHosts: [],
      createdBy: "ADMIN"
    });

    res.json({ success: true, training });
  } catch (error: any) {
    console.error("Error creating zoom training:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, zoomLink, meetingId, password, scheduledAt, duration, isActive } = req.body;

    const training = await ZoomTraining.findOneAndUpdate(
      { id },
      {
        title,
        description,
        zoomLink,
        meetingId,
        password,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        duration,
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!training) {
      return res.status(404).json({ success: false, error: "Eğitim bulunamadı." });
    }

    res.json({ success: true, training });
  } catch (error: any) {
    console.error("Error updating zoom training:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ZoomTraining.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: "Eğitim bulunamadı." });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting zoom training:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Admin Notifying & Broadcast Endpoints ───
router.post("/:id/notify", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const training = await ZoomTraining.findOne({ id });
    
    if (!training) {
      return res.status(404).json({ success: false, error: "Eğitim bulunamadı." });
    }

    const TurkishDate = new Date(training.scheduledAt).toLocaleString("tr-TR", {
      dateStyle: "long",
      timeStyle: "short"
    });

    await broadcastNotification(
      "zoom_training",
      `📢 Zoom Eğitimi Hatırlatması`,
      `"${training.title}" başlıklı eğitimimiz ${TurkishDate} tarihinde yapılacaktır.\nKatılım Linki: ${training.zoomLink}`,
      { trainingId: training.id }
    );

    training.notificationSent = true;
    await training.save();

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error sending training notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/notifications/broadcast", requireAdmin, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: "Başlık ve mesaj alanları zorunludur." });
    }

    const success = await broadcastNotification(type || "system", title, message);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: "Sistem duyurusu yayınlanırken hata oluştu." });
    }
  } catch (error: any) {
    console.error("Error broadcasting notification route:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Host Authorization Endpoints ───
router.get("/:zoomHostTrainingId/hosts", requireAdmin, async (req, res) => {
  try {
    const { zoomHostTrainingId } = req.params;
    const training = await ZoomTraining.findOne({ id: zoomHostTrainingId });
    if (!training) {
      return res.status(404).json({ success: false, error: "Eğitim bulunamadı." });
    }
    res.json({ success: true, hosts: training.authorizedHosts || [] });
  } catch (error: any) {
    console.error("Error getting authorized hosts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:trainingId/hosts", requireAdmin, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ success: false, error: "Kullanıcı ID ve işlem (action) belirtilmelidir." });
    }

    const training = await ZoomTraining.findOne({ id: trainingId });
    if (!training) {
      return res.status(404).json({ success: false, error: "Eğitim bulunamadı." });
    }

    let hosts = training.authorizedHosts || [];
    if (action === "grant") {
      if (!hosts.includes(userId)) {
        hosts.push(userId);
      }
    } else if (action === "revoke") {
      hosts = hosts.filter((uid: string) => uid !== userId);
    } else {
      return res.status(400).json({ success: false, error: "Bilinmeyen işlem türü." });
    }

    training.authorizedHosts = hosts;
    await training.save();

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating authorized hosts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
