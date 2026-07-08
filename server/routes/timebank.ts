import { Router } from "express";
import { mongoDb } from "../lib/mongo-database";
import { verifyAccessToken } from "../lib/utils";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const router = Router();

// TIME CREDIT PRICE CONSTANT
const TIME_CREDIT_PRICE_USD = 5; // 1 zaman kredisi = 5 dolar

// Authentication middleware
async function getAuthenticatedUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Yetkilendirme başlığı gereklidir." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Geçersiz veya süresi dolmuş token." });
    }
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Geçersiz token." });
    }
    const user = await mongoDb.getUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: "Kullanıcı bulunamadı." });
    }
    req.user = user;
    req.userId = user.id || userId;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ success: false, error: "Yetkilendirme hatası." });
  }
}

// Get education requests
router.get("/requests", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { status } = req.query;
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }

    const requestsDb = db.collection("educationRequests");

    let query: any = {};
    if (status) query.status = status;

    const requests = await requestsDb.find(query).toArray();
    res.json({ success: true, requests: requests || [] });
  } catch (error) {
    console.error("Error fetching education requests:", error);
    res.status(500).json({ success: false, error: "Eğitim talepleri alınamadı." });
  }
});

// Create education request
router.post("/requests/create", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { topic, description, level } = req.body;

    if (!topic || !description) {
      return res.status(400).json({ success: false, error: "Konu ve açıklama gereklidir." });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }

    const requestId = `edu-req-${uuidv4()}`;
    const educationRequest = {
      id: requestId,
      requesterId: req.userId,
      requesterName: req.user.fullName,
      topic,
      description,
      level: level || req.user.careerLevel?.displayName || "Başlangıç",
      timestamp: new Date(),
      status: "pending",
      participants: [],
      mentorId: null,
      zoomLink: null,
      startTime: null,
      createdAt: new Date(),
    };

    const requestsDb = db.collection("educationRequests");
    await requestsDb.insertOne(educationRequest);

    res.json({ success: true, request: educationRequest });
  } catch (error) {
    console.error("Error creating education request:", error);
    res.status(500).json({ success: false, error: "Eğitim talebi oluşturulamadı." });
  }
})

// Reserve mentor session
router.post("/reserve-session", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { mentorId, mentorName, topic, cost } = req.body;

    if (!mentorId || !topic || cost === undefined) {
      return res.status(400).json({ success: false, error: "Eksik parametreler." });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }

    // Get current user (check credits)
    const currentTimeCredits = req.user.blueprintSettings?.timeCredits || 0;

    if (currentTimeCredits < cost) {
      return res.status(400).json({
        success: false,
        error: `Yetersiz kredi. Gerekli: ${cost}, Mevcut: ${currentTimeCredits}`
      });
    }

    // Deduct credits
    const usersDb = db.collection("users");
    await usersDb.updateOne(
      { id: req.userId },
      { $inc: { "blueprintSettings.timeCredits": -cost } }
    );

    // Create transaction record
    const txId = `tx-mentor-${uuidv4()}`;
    const transactionsDb = db.collection("transactions");
    await transactionsDb.insertOne({
      id: txId,
      userId: req.userId,
      type: "mentor_session",
      amount: cost * TIME_CREDIT_PRICE_USD,
      currency: "USD",
      status: "completed",
      mentorId,
      mentorName,
      topic,
      description: `Mentor seansı: ${topic}`,
      reference: `MENTOR-${Date.now()}`,
      timestamp: new Date(),
    });

    res.json({ success: true, message: "Mentor seansı rezerve edildi." });
  } catch (error) {
    console.error("Error reserving mentor session:", error);
    res.status(500).json({ success: false, error: "Seansa katılırken hata oluştu." });
  }
})

// Accept education request and start session
router.post("/accept-request", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { requestId, zoomLink } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, error: "Talep ID'si gereklidir." });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }

    const requestsDb = db.collection("educationRequests");
    const generatedZoomLink = zoomLink || `https://zoom.us/j/${Math.random().toString(36).substring(7)}`;

    await requestsDb.updateOne(
      { id: requestId },
      {
        $set: {
          status: "in_progress",
          mentorId: req.userId,
          zoomLink: generatedZoomLink,
          startTime: new Date(),
        }
      }
    );

    res.json({ success: true, zoomLink: generatedZoomLink });
  } catch (error) {
    console.error("Error accepting education request:", error);
    res.status(500).json({ success: false, error: "Eğitim başlatılırken hata oluştu." });
  }
})

// Join education session (requester joins)
router.post("/join-session", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, error: "Talep ID'si gereklidir." });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }

    const requestsDb = db.collection("educationRequests");
    const educationRequest = await requestsDb.findOne({ id: requestId });

    if (!educationRequest) {
      return res.status(404).json({ success: false, error: "Eğitim talebi bulunamadı." });
    }

    if (educationRequest.status !== "in_progress") {
      return res.status(400).json({ success: false, error: "Eğitim henüz başlamadı." });
    }

    // Add participant to the session
    await requestsDb.updateOne(
      { id: requestId },
      {
        $addToSet: {
          participants: {
            userId: req.userId,
            userName: req.user.fullName,
            joinedAt: new Date(),
          }
        }
      }
    );

    res.json({
      success: true,
      zoomLink: educationRequest.zoomLink,
      participants: educationRequest.participants || []
    });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ success: false, error: "Oturuma katılırken hata oluştu." });
  }
})

// Complete education - transfer payment from requester to mentor
router.post("/complete-education", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { requestId, requesterId } = req.body;

    if (!requestId || !requesterId) {
      return res.status(400).json({ success: false, error: "Eksik parametreler." });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }

    const requestsDb = db.collection("educationRequests");
    const usersDb = db.collection("users");

    // Get education request
    const educationRequest = await requestsDb.findOne({ id: requestId });
    if (!educationRequest) {
      return res.status(404).json({ success: false, error: "Eğitim talebi bulunamadı." });
    }

    // Get requester (student)
    const requester = await usersDb.findOne({ id: requesterId });
    if (!requester) {
      return res.status(404).json({ success: false, error: "Eğitim talep eden kullanıcı bulunamadı." });
    }

    // Get mentor (current user)
    const mentor = req.user;
    const amount = TIME_CREDIT_PRICE_USD; // 1 time credit = $5

    // Check if requester has enough balance
    const requesterBalance = requester.wallet?.balance || 0;
    if (requesterBalance < amount) {
      return res.status(400).json({ 
        success: false, 
        error: `Kullanıcının cüzdanında yeterli bakiye yok. Gerekli: $${amount}, Mevcut: $${requesterBalance}` 
      });
    }

    // Deduct from requester's wallet
    await usersDb.updateOne(
      { id: requesterId },
      { 
        $inc: { "wallet.balance": -amount }
      }
    );

    // Add to mentor's wallet
    await usersDb.updateOne(
      { id: req.userId },
      { 
        $inc: { 
          "wallet.balance": amount,
          "wallet.totalEarnings": amount,
          "blueprintSettings.timeCredits": 1
        }
      }
    );

    // Create transactions for both users
    const transactionsDb = db.collection("transactions");
    const txId = `tx-edu-${uuidv4()}`;

    await transactionsDb.insertMany([
      {
        id: `${txId}-requester`,
        userId: requesterId,
        type: "education_payment",
        amount: -amount,
        currency: "USD",
        status: "completed",
        description: `${educationRequest.topic} eğitimi için ödeme`,
        reference: requestId,
        mentorId: req.userId,
        mentorName: mentor.fullName,
        timestamp: new Date(),
      },
      {
        id: `${txId}-mentor`,
        userId: req.userId,
        type: "education_earnings",
        amount: amount,
        currency: "USD",
        status: "completed",
        description: `${educationRequest.topic} eğitim geliri`,
        reference: requestId,
        studentId: requesterId,
        studentName: requester.fullName,
        timestamp: new Date(),
      }
    ]);

    // Update request status
    await requestsDb.updateOne(
      { id: requestId },
      { 
        $set: { 
          status: "completed",
          completedAt: new Date(),
          mentorId: req.userId,
        }
      }
    );

    res.json({ 
      success: true, 
      message: "Eğitim tamamlandı ve ödeme yapıldı.",
      mentorBalance: requesterBalance - amount,
      mentorEarnings: amount,
    });
  } catch (error) {
    console.error("Error completing education:", error);
    res.status(500).json({ success: false, error: "Eğitim tamamlanırken hata oluştu." });
  }
});

// Get user's time credits
router.get("/credits", getAuthenticatedUser, async (req: any, res) => {
  try {
    const timeCredits = req.user.blueprintSettings?.timeCredits || 0;
    res.json({ success: true, timeCredits });
  } catch (error) {
    console.error("Error fetching time credits:", error);
    res.status(500).json({ success: false, error: "Zaman kredileri alınamadı." });
  }
});

// Get participants in a session
router.get("/session/:requestId/participants", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { requestId } = req.params;
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: "Veritabanı bağlantısı kurulamadı." });
    }
    const requestsDb = db.collection("educationRequests");
    
    const educationRequest = await requestsDb.findOne({ id: requestId });
    if (!educationRequest) {
      return res.status(404).json({ success: false, error: "Eğitim oturumu bulunamadı." });
    }

    res.json({ 
      success: true, 
      participants: educationRequest.participants || [],
      totalParticipants: (educationRequest.participants || []).length
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ success: false, error: "Katılımcılar alınamadı." });
  }
});

export default router;
