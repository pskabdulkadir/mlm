import { Router } from "express";
import mongoose from "mongoose";
import { User, MonthlySummary, CompanyFund, WalletTransaction, ProductPurchase, BlueprintRequest, Notification } from "../lib/models";
import { getCacheManager } from "../config/cache.config";
import { MonolineCommissionService } from "../lib/monoline-commission-service";

const router = Router();

/**
 * Micro-Endpoint: GET /api/commissions/eligibility/:userId
 * State Machine (Redis) backed endpoint for $100 Active Status & HELD Earnings.
 * Uses predictive alerting to warn users about missing volumes.
 */
router.get("/eligibility/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cache = await getCacheManager();
    const cacheKey = `user:eligibility:${userId}`;

    // Try to serve from high-performance Redis/Memory Cache
    const cachedData = await cache.get<any>(cacheKey);
    if (cachedData) {
      return res.json({ success: true, source: "redis", ...cachedData });
    }

    // DB Fallback & Calculation
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const eligibility = await MonolineCommissionService.checkUserEligibility(userId);

    // Predictive Alerting: Message and actions
    let alertMessage = "";
    let actionTip = "";
    if (!eligibility.isEligible) {
      const lostEarnings = eligibility.unearnedCareer + eligibility.unearnedPool;
      alertMessage = `Şu an aktiflik limitinin ($100 USD) altındasınız. Bu ay hak ettiğiniz $${lostEarnings.toFixed(2)} USD priminiz HELD (beklemede) durumdadır.`;
      actionTip = `Havuz ve kariyer kazançlarınızı serbest bırakıp cüzdanınıza aktarmak için sadece $${eligibility.remainingVolume.toFixed(2)} USD daha ciro yapmalısınız!`;
    } else {
      alertMessage = `Tebrikler! $100 USD aktiflik barajını aştınız. Tüm kariyer, derinlik ve havuz primlerini almaya hak kazandınız.`;
      actionTip = `Aktif üye statüsündesiniz. Ekibinizi büyüterek unilevel gelirlerinizi artırmaya devam edin.`;
    }

    const payload = {
      isEligible: eligibility.isEligible,
      personalVolume: eligibility.personalVolume,
      remainingVolume: eligibility.remainingVolume,
      unearnedSponsor: eligibility.unearnedSponsor,
      unearnedCareer: eligibility.unearnedCareer,
      unearnedPool: eligibility.unearnedPool,
      totalHeld: eligibility.unearnedCareer + eligibility.unearnedPool,
      alertMessage,
      actionTip,
      updatedAt: new Date()
    };

    // Store in cache for 5 minutes
    await cache.set(cacheKey, payload, 300);

    return res.json({ success: true, source: "db", ...payload });
  } catch (error: any) {
    console.error("Error in /eligibility/:userId:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: GET /api/commissions/challenges/:userId
 * Otonom Beyin (Event-Driven / DynamicThreshold) Challenge Generator.
 * Creates personalized monthly goals for members based on performance.
 */
router.get("/challenges/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cache = await getCacheManager();
    const cacheKey = `user:challenges:${userId}`;

    const cachedData = await cache.get<any>(cacheKey);
    if (cachedData) {
      return res.json({ success: true, source: "redis", challenges: cachedData });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const eligibility = await MonolineCommissionService.checkUserEligibility(userId);
    const directReferrals = user.directReferrals || 0;
    const teamTurnover = user.total_team_ciro || user.totalTeamCiroTL || 0;

    const challenges = [];

    // Challenge 1: Active Volume Threshold
    if (eligibility.personalVolume < 100) {
      challenges.push({
        id: "ch_active_100",
        title: "Aktiflik Sınırını Aş 🚀",
        description: "Aylık 100$ kişisel hacme ulaşarak tüm kariyer ve havuz gelirlerini aktif et.",
        target: 100,
        current: eligibility.personalVolume,
        unit: "$",
        progress: Math.min(100, Math.round((eligibility.personalVolume / 100) * 100)),
        reward: "Held Primlerini Çöz & Pool Dağıtımı",
        type: "personal_volume"
      });
    } else {
      challenges.push({
        id: "ch_active_100_done",
        title: "Aktiflik Sınırı Aşıldı! ⭐",
        description: "Bu ayki 100$ aktiflik hedefini tamamladınız. Harika iş!",
        target: 100,
        current: eligibility.personalVolume,
        unit: "$",
        progress: 100,
        reward: "Tüm Gelirler Aktif",
        type: "personal_volume"
      });
    }

    // Challenge 2: Sponsor Referrals (Dynamic based on current references)
    const refTarget = directReferrals < 3 ? 3 : directReferrals + 2;
    challenges.push({
      id: "ch_referrals",
      title: "Ekibini Büyüt (Doğrudan Sponsor) 👥",
      description: `Doğrudan sponsor gelirlerini maksimize etmek için toplam ${refTarget} doğrudan aktif referansa ulaş.`,
      target: refTarget,
      current: directReferrals,
      unit: "Üye",
      progress: Math.min(100, Math.round((directReferrals / refTarget) * 100)),
      reward: "Yüksek Sponsor Bonusu (%25)",
      type: "referrals"
    });

    // Challenge 3: Team Turnover Expansion (Dynamic based on team sizes)
    const turnoverTarget = teamTurnover < 500 ? 500 : teamTurnover < 2500 ? 2500 : teamTurnover + 5000;
    challenges.push({
      id: "ch_turnover",
      title: "Derinlik Liderliği Hacmi 📈",
      description: `Kariyer atlamak ve 7 unilevel derinlik primlerini yükseltmek için ekip cironu $${turnoverTarget} seviyesine taşı.`,
      target: turnoverTarget,
      current: teamTurnover,
      unit: "$",
      progress: Math.min(100, Math.round((teamTurnover / turnoverTarget) * 100)),
      reward: "Kariyer Terfisi & Derinlik Kilidi",
      type: "turnover"
    });

    // Store in cache for 5 minutes
    await cache.set(cacheKey, challenges, 300);

    return res.json({ success: true, source: "db", challenges });
  } catch (error: any) {
    console.error("Error in /challenges/:userId:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: GET /api/commissions/summary-stats
 * Admin Dashboard - Aggregates summary stats without scanning all users.
 * Sourced directly from Read-Only Summary projections.
 */
router.get("/summary-stats", async (req, res) => {
  try {
    const yearMonth = new Date().toISOString().slice(0, 7);

    // 1. Total Company Fund
    const fundDoc = await CompanyFund.findOne({});
    const totalCompanyFund = fundDoc ? fundDoc.totalAmount : 0;

    // 2. Paid / Held Commissions from Wallet Transactions (Indexed queries)
    const transactionStats = await WalletTransaction.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const totalPaidCommissions = transactionStats.find(s => s._id === "PAID")?.total || 0;
    const totalHeldCommissions = transactionStats.find(s => s._id === "HELD")?.total || 0;

    // 3. Active vs Passive Ratio from MonthlySummary
    const summaryStats = await MonthlySummary.aggregate([
      { $match: { yearMonth } },
      {
        $group: {
          _id: "$isEligibleForPoolsAndBonuses",
          count: { $sum: 1 }
        }
      }
    ]);

    const activeCount = summaryStats.find(s => s._id === true)?.count || 0;
    const passiveCount = summaryStats.find(s => s._id === false)?.count || 0;
    const totalMembers = activeCount + passiveCount;

    const activeRatio = totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0;

    return res.json({
      success: true,
      stats: {
        totalCompanyFund,
        totalPaidCommissions,
        totalHeldCommissions,
        activeMemberCount: activeCount,
        passiveMemberCount: passiveCount,
        totalMembers,
        activeRatio
      }
    });
  } catch (error: any) {
    console.error("Error in /summary-stats:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: GET /api/commissions/compliance-members
 * Admin Panel - Lists eligible vs ineligible users of the current cycle.
 * Sourced directly from Read-Only projections to scale to 100M users.
 */
router.get("/compliance-members", async (req, res) => {
  try {
    const { status, search } = req.query;
    const yearMonth = new Date().toISOString().slice(0, 7);

    // Build filter query
    const filterQuery: any = { yearMonth };
    if (status === "eligible") {
      filterQuery.isEligibleForPoolsAndBonuses = true;
    } else if (status === "ineligible") {
      filterQuery.isEligibleForPoolsAndBonuses = false;
    }

    const summaries = await MonthlySummary.find(filterQuery).lean();

    // Map summaries with user details
    const populatedMembers = [];
    for (const summary of summaries) {
      const user = await User.findOne({ id: summary.userId }).lean();
      if (user) {
        // If search term is active, filter out
        if (search) {
          const term = String(search).toLowerCase();
          const matchesSearch =
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.memberId && user.memberId.toLowerCase().includes(term));
          if (!matchesSearch) continue;
        }

        populatedMembers.push({
          id: user.id,
          memberId: user.memberId || "M-N/A",
          fullName: user.fullName,
          email: user.email,
          careerLevel: (user.careerLevel as any)?.displayName || user.careerLevel || "Mülhime",
          personalSalesVolume: summary.personalSalesVolume,
          isEligible: summary.isEligibleForPoolsAndBonuses,
          careerEarnings: summary.careerEarnings,
          poolEarnings: summary.poolEarnings,
          status: summary.status
        });
      }
    }

    return res.json({
      success: true,
      members: populatedMembers
    });
  } catch (error: any) {
    console.error("Error in /compliance-members:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: GET /api/commissions/blueprint/state
 * Fetches the global configuration & state of the Master Blueprint advanced modules.
 */
router.get("/blueprint/state", async (req, res) => {
  try {
    // 1. Fetch active users count under Burnout mode (Bio-Digital)
    const burnoutUsers = await User.find({ isBurnoutActive: true }).select("id fullName email").lean();

    // 2. Fetch users with assigned heirs (Legacy Mode)
    const heirUsers = await User.find({ "legacyHeir.fullName": { $exists: true } }).select("id fullName email legacyHeir").lean();

    // 3. Fetch users with temporary sponsor re-routing (Shadow-Branch Recovery)
    const recoveredUsers = await User.find({ originalSponsorId: { $exists: true, $ne: null } }).select("id fullName email sponsorId originalSponsorId").lean();

    // 4. Default balances or values for pools
    const insurancePoolBalance = 15420.50; // Dynamic simulation backed
    const brotherhoodPoolBalance = 8740.00; // Dynamic simulation backed
    const totalEcoCredits = 12400; // Total Eco-sync credits produced
    const totalTimeCredits = 3450; // Time-Bank credits

    const { userId } = req.query;
    let userSpecific = null;
    if (userId) {
      const u = await User.findOne({ id: userId });
      if (u) {
        userSpecific = {
          legacyHeir: u.legacyHeir || null,
          isBurnoutActive: u.isBurnoutActive || false,
          donationRate: (u as any).blueprintSettings?.donationRate ?? 0,
          refusalsCount: (u as any).blueprintSettings?.refusalsCount ?? 0,
          refusalTitle: (u as any).blueprintSettings?.refusalTitle ?? "Acemi Satıcı",
          timeCredits: (u as any).blueprintSettings?.timeCredits ?? 3,
          natureCredits: Math.round(((u.monthlySalesVolume || 0) + (u.annualSalesVolume || 0)) / 100) * 3 || 0
        };
      }
    }

    const allRequests = await BlueprintRequest.find({}).sort({ createdAt: -1 }).lean();
    let userRequests = [];
    if (userId) {
      userRequests = await BlueprintRequest.find({ userId }).sort({ createdAt: -1 }).lean();
    }

    const allUsers = await User.find({}).select("id fullName email isBurnoutActive legacyHeir originalSponsorId lastLoginDate death_certificate_verified activity_score blueprintSettings monthlySalesVolume").lean();

    return res.json({
      success: true,
      burnoutUsers,
      heirUsers,
      recoveredUsers,
      insurancePoolBalance,
      brotherhoodPoolBalance,
      totalEcoCredits,
      totalTimeCredits,
      userSpecific,
      allRequests,
      userRequests,
      allUsers
    });
  } catch (error: any) {
    console.error("Error in /blueprint/state:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: POST /api/commissions/blueprint/action
 * Triggers actions for the advanced otonom zeka katmanı master blueprint.
 */
router.post("/blueprint/action", async (req, res) => {
  try {
    const { action, userId, targetUserId, amount, heirName, heirEmail, heirPhone, sourceSponsorId, initiatedByAdmin } = req.body;

    const requiresApproval = ["insurance-grant", "kardeslik-aid", "assign-heir", "trigger-inheritance", "toggle-burnout"].includes(action);

    if (requiresApproval && !initiatedByAdmin) {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const requestingUser = await User.findOne({ id: userId });
      if (!requestingUser) {
        return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
      }

      // Check for duplicate pending request
      const existingPending = await BlueprintRequest.findOne({
        userId,
        type: action,
        status: "pending"
      });
      if (existingPending) {
        return res.status(400).json({
          success: false,
          message: "Bu kategori için zaten bekleyen bir onay talebiniz bulunmaktadır."
        });
      }

      const newRequest = new BlueprintRequest({
        id: "req_" + Math.random().toString(36).substr(2, 9),
        userId: userId,
        userName: requestingUser.fullName,
        userEmail: requestingUser.email,
        type: action,
        amount: Number(amount) || 0,
        details: {
          heirName,
          heirEmail,
          heirPhone,
          targetUserId
        },
        status: "pending",
        createdAt: new Date()
      });
      await newRequest.save();

      // Notify Admin
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        const adminNotif = new Notification({
          id: "notif_" + Math.random().toString(36).substr(2, 9),
          userId: admin.id,
          type: "system",
          title: "Yeni Otonom İşlem Talebi",
          message: `${requestingUser.fullName} adlı üye yeni bir ${action === 'insurance-grant' ? 'Sigorta Fonu' : action === 'kardeslik-aid' ? 'Kardeşlik Desteği' : action === 'assign-heir' ? 'Varis Atama' : action === 'trigger-inheritance' ? 'Veraset Protokolü' : 'Burnout Mola'} talebinde bulundu.`,
          createdAt: new Date()
        });
        await adminNotif.save();
      }

      return res.json({
        success: true,
        message: "Talebiniz başarıyla kaydedildi. Yönetici onayının ardından aktif olacaktır.",
        isPendingRequest: true
      });
    }

    if (action === "verify-death-certificate") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      await User.updateOne({ id: userId }, { $set: { death_certificate_verified: true, inheritance_status: "pending" } });

      if (user.legacyHeir && user.legacyHeir.fullName) {
        const requestId = "req_" + Math.random().toString(36).substr(2, 9);
        const newReq = new BlueprintRequest({
          id: requestId,
          userId: userId,
          userName: user.fullName,
          userEmail: user.email,
          type: "trigger-inheritance",
          amount: 0,
          details: {
            heirName: user.legacyHeir.fullName,
            heirEmail: user.legacyHeir.email,
            heirPhone: user.legacyHeir.phone || "",
            reason: "Ölüm Belgesi Onaylandı (Admin)",
          },
          status: "pending",
          createdAt: new Date()
        });
        await newReq.save();

        return res.json({
          success: true,
          message: `Kullanıcının vefat belgesi onaylandı! Varis ${user.legacyHeir.fullName} için Veraset Devri otonom süreci otonom olarak başlatıldı ve Onay Havuzuna gönderildi.`
        });
      } else {
        return res.json({
          success: true,
          message: `Vefat belgesi onaylandı fakat atanmış varis bulunamadığı için otonom devir başlatılamadı.`
        });
      }
    }

    if (action === "simulate-six-months-inactivity") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 7);

      await User.updateOne({ id: userId }, { $set: { lastLoginDate: sixMonthsAgo, inheritance_status: "pending" } });

      if (user.legacyHeir && user.legacyHeir.fullName) {
        const requestId = "req_" + Math.random().toString(36).substr(2, 9);
        const newReq = new BlueprintRequest({
          id: requestId,
          userId: userId,
          userName: user.fullName,
          userEmail: user.email,
          type: "trigger-inheritance",
          amount: 0,
          details: {
            heirName: user.legacyHeir.fullName,
            heirEmail: user.legacyHeir.email,
            heirPhone: user.legacyHeir.phone || "",
            reason: "6 Ay İnaktiflik Süresi Aşıldı (Simülasyon)",
          },
          status: "pending",
          createdAt: new Date()
        });
        await newReq.save();

        return res.json({
          success: true,
          message: `6 ay inaktiflik simüle edildi! Varis ${user.legacyHeir.fullName} için Veraset Devri otonom süreci otonom olarak tetiklendi ve Onay Havuzuna gönderildi.`
        });
      } else {
        return res.json({
          success: true,
          message: `İnaktiflik simüle edildi fakat atanmış varis bulunamadığı için otonom devir başlatılamadı.`
        });
      }
    }

    if (action === "update-activity-score") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const score = Number(amount);
      await User.updateOne({ id: userId }, { $set: { activity_score: score } });
      return res.json({ success: true, message: `Kullanıcının aktivite skoru ${score} olarak güncellendi.` });
    }

    if (action === "update-burnout-index") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const burnoutIdx = Number(amount);
      await User.updateOne({ id: userId }, { $set: { "blueprintSettings.burnout_index": burnoutIdx } });

      if (burnoutIdx > 80) {
        await User.updateOne({ id: userId }, { $set: { isBurnoutActive: true, isSalesLocked: true, salesLockedUntil: new Date(Date.now() + 48 * 60 * 60 * 1000) } });
        return res.json({
          success: true,
          message: `Tükenmişlik endeksi %${burnoutIdx} olarak tespit edildi! Otonom Koruma: Kullanıcı zorunlu dinlenme moduna alındı ve tüm satış girişleri 48 saatliğine kilitlendi.`
        });
      } else {
        await User.updateOne({ id: userId }, { $set: { isBurnoutActive: false, isSalesLocked: false } });
        return res.json({ success: true, message: `Tükenmişlik endeksi %${burnoutIdx} olarak güncellendi. Normal performans modu aktif.` });
      }
    }

    if (action === "assign-heir") {
      if (!userId || !heirName || !heirEmail) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID, varis adı ve e-postası zorunludur." });
      }
      await User.updateOne({ id: userId }, {
        $set: {
          legacyHeir: {
            fullName: heirName,
            email: heirEmail,
            phone: heirPhone || "",
            status: "ASSIGNED",
            assignedAt: new Date()
          }
        }
      });
      return res.json({ success: true, message: `Varis (${heirName}) başarıyla atandı.` });
    }

    if (action === "update-donation-rate") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      await User.updateOne({ id: userId }, { $set: { "blueprintSettings.donationRate": Number(amount) || 0 } });
      return res.json({ success: true, message: `Kardeşlik Havuzu bağış oranı %${amount} olarak güncellendi.` });
    }

    if (action === "log-refusal") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      const currentRefusals = (user as any).blueprintSettings?.refusalsCount || 0;
      const newRefusals = currentRefusals + 1;
      let title = "Acemi Satıcı";
      let rewardPoints = 0;
      if (newRefusals >= 50) {
        title = "Göklerin Hakimi Lider";
        rewardPoints = 500;
      } else if (newRefusals >= 25) {
        title = "Kamil Satıcı";
        rewardPoints = 250;
      } else if (newRefusals >= 10) {
        title = "Deneyimli Satıcı";
        rewardPoints = 100;
      } else if (newRefusals >= 5) {
        title = "Korkusuz Savaşçı";
        rewardPoints = 50;
      }

      await User.updateOne({ id: userId }, {
        $set: {
          "blueprintSettings.refusalsCount": newRefusals,
          "blueprintSettings.refusalTitle": title
        },
        $inc: {
          "pointsSystem.totalPoints": rewardPoints > 0 ? rewardPoints : 10
        }
      });

      return res.json({ 
        success: true, 
        message: `Reddedilme otonom kaydedildi! Toplam Red: ${newRefusals}. Ünvan: ${title}.`,
        refusalsCount: newRefusals,
        refusalTitle: title
      });
    }

    if (action === "buy-mentor-session") {
      if (!userId) return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      const cost = Number(amount) || 1; // 1 Time-Credit
      const userCredits = (user as any).blueprintSettings?.timeCredits ?? 3;
      if (userCredits < cost) {
        return res.status(400).json({ success: false, message: `Zaman Krediniz yetersiz! Mevcut: ${userCredits}, Gereken: ${cost}` });
      }

      await User.updateOne({ id: userId }, {
        $inc: {
          "blueprintSettings.timeCredits": -cost
        }
      });

      return res.json({ 
        success: true, 
        message: `Mentor oturumu başarıyla satın alındı! ${cost} Zaman Kredisi cüzdanınızdan düşüldü.`,
        remainingCredits: userCredits - cost
      });
    }

    if (action === "earn-time-credit") {
      if (!userId) return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      await User.updateOne({ id: userId }, {
        $inc: {
          "blueprintSettings.timeCredits": 1
        }
      });
      return res.json({ success: true, message: `1 Saatlik eğitim sundunuz ve 1 Zaman Kredisi kazandınız!` });
    }

    if (action === "trigger-inheritance") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID zorunludur." });
      }
      const user = await User.findOne({ id: userId });
      if (!user || !user.legacyHeir || !user.legacyHeir.fullName) {
        return res.status(404).json({ success: false, message: "Kullanıcı veya atanmış varis bulunamadı." });
      }

      const originalName = user.fullName;
      const heirNameVal = user.legacyHeir.fullName;
      const heirEmailVal = user.legacyHeir.email;

      await User.updateOne({ id: userId }, {
        $set: {
          fullName: heirNameVal,
          email: heirEmailVal,
          "legacyHeir.status": "TRANSFERRED",
          "legacyHeir.transferredAt": new Date()
        }
      });

      return res.json({
        success: true,
        message: `Veraset Protokolü başlatıldı! ${originalName} hesabının hakları otonom olarak ${heirNameVal} (${heirEmailVal}) varisine devredildi.`
      });
    }

    if (action === "shadow-recovery-run") {
      // Find inactive sponsors whose activity_score is 0 OR isActive is false (representing 30 days inactive sponsor)
      const inactiveUsers = await User.find({ $or: [{ activity_score: 0 }, { isActive: false }] }).select("id").lean();
      const inactiveIds = inactiveUsers.map(u => u.id);

      if (inactiveIds.length === 0) {
        return res.json({ success: true, message: "Sistemde pasif durumda (Aktivite Skoru: 0) sponsor bulunamadı.", updatedCount: 0 });
      }

      // Re-route users whose sponsor is in the inactive list, keeping their original sponsor in originalSponsorId
      const affectedUsers = await User.find({ sponsorId: { $in: inactiveIds }, originalSponsorId: { $exists: false } }).lean();
      
      let updatedCount = 0;
      for (const u of affectedUsers) {
        await User.updateOne({ id: u.id }, {
          $set: {
            originalSponsorId: u.sponsorId,
            sponsorId: "admin" // Re-route to ActivePool top leader (admin)
          }
        });
        updatedCount++;
      }

      return res.json({
        success: true,
        message: `${updatedCount} adet kayıp dal tespit edildi (Sponsor Aktivite Skoru: 0) ve geçici olarak otonom olarak ActivePool üst liderine (Admin) yönlendirildi.`,
        updatedCount
      });
    }

    if (action === "shadow-recovery-restore") {
      // Restore original sponsors if their activity_score has returned to >0 (representing return of original sponsor)
      const recovered = await User.find({ originalSponsorId: { $exists: true, $ne: null } }).lean();
      let updatedCount = 0;
      for (const u of recovered) {
        // Find if old sponsor is now active (activity_score > 0)
        const oldSponsor = await User.findOne({ id: u.originalSponsorId });
        if (oldSponsor && (oldSponsor.activity_score > 0 || oldSponsor.isActive)) {
          await User.updateOne({ id: u.id }, {
            $set: {
              sponsorId: u.originalSponsorId
            },
            $unset: {
              originalSponsorId: ""
            }
          });
          updatedCount++;
        }
      }

      return res.json({
        success: true,
        message: `${updatedCount} adet üyenin ağaç yapısı, eski sponsorlarının (Aktivite Skoru > 0) geri dönmesiyle otonom olarak eski haline geri yüklendi (RestoreBranch).`,
        updatedCount
      });
    }

    if (action === "energy-clean") {
      // Find 6-months inactive dead accounts (where monthlySalesVolume is 0 and not yet marked dead)
      const deadUsers = await User.find({ monthlySalesVolume: 0, isDeadAccount: { $ne: true } }).limit(5).lean();
      
      let finalDeadUsers = deadUsers;
      if (finalDeadUsers.length === 0) {
        // Fallback to searching inactive users if no user has exactly 0 volume
        finalDeadUsers = await User.find({ isActive: false, isDeadAccount: { $ne: true } }).limit(5).lean();
      }

      if (finalDeadUsers.length === 0) {
        return res.json({ success: true, message: "Algoritmik Temizlik: Temizlenecek 6 aydır satış yapmayan ölü hesap bulunamadı." });
      }

      let compressedCount = 0;
      for (const dead of finalDeadUsers) {
        // Run Compression motor: route downlines directly to dead user's active sponsor (upline compression)
        if (dead.sponsorId) {
          await User.updateMany({ sponsorId: dead.id }, { $set: { sponsorId: dead.sponsorId } });
          
          // Reward the active upline with $50 "Sistem Verimlilik Primi"
          await User.updateOne({ id: dead.sponsorId }, { $inc: { "wallet.balance": 50 } });
        } else {
          // If no sponsor, reward admin as fallback
          await User.updateOne({ role: "admin" }, { $inc: { "wallet.balance": 50 } });
        }
        await User.updateOne({ id: dead.id }, { $set: { isDeadAccount: true, isActive: false } });
        compressedCount++;
      }

      return res.json({
        success: true,
        message: `Algoritmik Temizlik tamamlandı! ${compressedCount} adet 6 aydır satış yapmayan ölü hesap dormant_mode'a alındı, ağaçtan izole edildi ve alt ağaçları sıkıştırıldı. Aktif üst liderlere $50.00 USD 'Sistem Verimlilik Primi' otonom olarak ödendi.`
      });
    }

    if (action === "insurance-grant") {
      if (!userId || !amount) {
        return res.status(400).json({ success: false, message: "Kullanıcı ve yardım miktarı gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      await User.updateOne({ id: userId }, { $inc: { "wallet.balance": Number(amount) } });

      return res.json({
        success: true,
        message: `Sigorta Fonundan ${user.fullName} liderimize $${amount} USD tutarında otonom kriz destek yardımı aktarıldı.`
      });
    }

    if (action === "toggle-burnout") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      const nextState = !user.isBurnoutActive;
      await User.updateOne({ id: userId }, { $set: { isBurnoutActive: nextState } });

      return res.json({
        success: true,
        message: `${user.fullName} için Zorunlu Dinlenme/Meditasyon Molası (Burnout Koruma) ${nextState ? "aktif edildi. Satış baskısı geçici olarak kaldırıldı ve hak ediş koruması devreye alındı." : "kaldırıldı."}`,
        isBurnoutActive: nextState
      });
    }

    if (action === "kardeslik-aid") {
      if (!userId || !amount) {
        return res.status(400).json({ success: false, message: "Kullanıcı ve yardım miktarı gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      await User.updateOne({ id: userId }, { $inc: { "wallet.balance": Number(amount) } });

      return res.json({
        success: true,
        message: `Kardeşlik Havuzundan zor durumdaki ${user.fullName} üyemize $${amount} USD tutarında otonom destek aktarıldı.`
      });
    }

    if (action === "simulate-sandbox") {
      if (!userId || !targetUserId) {
        return res.status(400).json({ success: false, message: "Simüle edilecek üye ve yeni sponsor üye gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      const target = await User.findOne({ id: targetUserId });

      if (!user || !target) {
        return res.status(404).json({ success: false, message: "Simülasyon üyeleri bulunamadı." });
      }

      const currentSales = user.monthlySalesVolume || 0;
      const expectedTeamCiroIncrease = target.total_team_ciro + currentSales;

      return res.json({
        success: true,
        simulation: {
          userName: user.fullName,
          targetSponsorName: target.fullName,
          originalSponsorId: user.sponsorId,
          expectedCommissionChange: `+$${(currentSales * 0.15).toFixed(2)} USD (7 Derinlik Unilevel Primi artışı)`,
          expectedTeamCiroTL: expectedTeamCiroIncrease,
          treePath: `Sandbox Simülasyonu: [${target.fullName}] -> [${user.fullName}]`
        }
      });
    }

    if (action === "time-travel") {
      if (!userId) {
        return res.status(400).json({ success: false, message: "Kullanıcı ID gereklidir." });
      }
      const user = await User.findOne({ id: userId });
      if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

      const currentSales = user.monthlySalesVolume || 50;
      const streak = user.monthlyActivityStreak || 1;

      return res.json({
        success: true,
        projection: {
          userName: user.fullName,
          year1: `Aylık Kazanç: $${(currentSales * (1.2 + streak * 0.1)).toFixed(2)} USD (Tahmini Ekip Boyutu: ${Math.round(streak * 5 + 10)} Üye)`,
          year3: `Aylık Kazanç: $${(currentSales * (2.5 + streak * 0.3)).toFixed(2)} USD (Tahmini Ekip Boyutu: ${Math.round(streak * 25 + 150)} Üye)`,
          year5: `Aylık Kazanç: $${(currentSales * (6.0 + streak * 0.5)).toFixed(2)} USD (Tahmini Ekip Boyutu: ${Math.round(streak * 120 + 800)} Üye)`,
          aiRecommendation: "Aylık satış hızınızı %20 artırırsanız, 1. yıldaki kazancınız otonom katlama etkisiyle %45 daha yüksek olacaktır!"
        }
      });
    }

    return res.status(400).json({ success: false, message: "Geçersiz otonom eylemi." });
  } catch (error: any) {
    console.error("Error in /blueprint/action:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Endpoint for testing: Triggers eligibility and held commissions release instantly (Manual override)
 */
router.post("/trigger-release", async (req, res) => {
  try {
    const releaseResult = await MonolineCommissionService.releaseHeldCommissionsForEligibleUsers();
    return res.json({
      success: true,
      message: "Hak edişler ve bekleyen primler başarıyla işlendi.",
      ...releaseResult
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: POST /api/commissions/blueprint/request/resolve
 * Resolves (approves/rejects) a pending blueprint request.
 */
router.post("/blueprint/request/resolve", async (req, res) => {
  try {
    const { requestId, status } = req.body;
    if (!requestId || !status) {
      return res.status(400).json({ success: false, message: "Request ID ve status gereklidir." });
    }

    const request = await BlueprintRequest.findOne({ id: requestId });
    if (!request) {
      return res.status(404).json({ success: false, message: "Talep bulunamadı." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Bu talep zaten sonuçlandırılmış." });
    }

    if (status === "rejected") {
      request.status = "rejected";
      request.resolvedAt = new Date();
      await request.save();

      // Notify member
      const memberNotif = new Notification({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: request.userId,
        type: "system",
        title: "Master Blueprint Talebiniz Reddedildi",
        message: `Talep ettiğiniz ${request.type === 'insurance-grant' ? 'Sigorta Fonu Yardımı' : request.type === 'kardeslik-aid' ? 'Kardeşlik Yardımı' : request.type === 'assign-heir' ? 'Varis Değişikliği' : request.type === 'trigger-inheritance' ? 'Veraset Devri' : 'Burnout Mola'} talebi yönetici tarafından onaylanmadı.`,
        createdAt: new Date()
      });
      await memberNotif.save();

      return res.json({ success: true, message: "Talep reddedildi." });
    }

    if (status === "approved") {
      const userId = request.userId;
      const amount = request.amount;
      const details = request.details || {};

      if (request.type === "insurance-grant") {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

        await User.updateOne({ id: userId }, { $inc: { "wallet.balance": Number(amount) } });
        // Create a Wallet Transaction
        const transactionId = "tx_" + Math.random().toString(36).substr(2, 9);
        const tx = new WalletTransaction({
          userId: userId,
          amount: Number(amount),
          type: "BONUS",
          status: "PAID",
          reference: transactionId,
          description: "Sigorta Fonu Kriz Destek Yardımı",
          createdAt: new Date()
        });
        await tx.save();
      }

      else if (request.type === "kardeslik-aid") {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

        await User.updateOne({ id: userId }, { $inc: { "wallet.balance": Number(amount) } });
        // Create a Wallet Transaction
        const transactionId = "tx_" + Math.random().toString(36).substr(2, 9);
        const tx = new WalletTransaction({
          userId: userId,
          amount: Number(amount),
          type: "BONUS",
          status: "PAID",
          reference: transactionId,
          description: "Kardeşlik Havuzu Destek Yardımı",
          createdAt: new Date()
        });
        await tx.save();
      }

      else if (request.type === "assign-heir") {
        await User.updateOne({ id: userId }, {
          $set: {
            legacyHeir: {
              fullName: details.heirName,
              email: details.heirEmail,
              phone: details.heirPhone || "",
              status: "ASSIGNED",
              assignedAt: new Date()
            }
          }
        });
      }

      else if (request.type === "trigger-inheritance") {
        const user = await User.findOne({ id: userId });
        if (!user || !user.legacyHeir || !user.legacyHeir.fullName) {
          return res.status(404).json({ success: false, message: "Kullanıcı veya atanmış varis bulunamadı." });
        }
        const originalName = user.fullName;
        const heirNameVal = user.legacyHeir.fullName;
        const heirEmailVal = user.legacyHeir.email;

        await User.updateOne({ id: userId }, {
          $set: {
            fullName: heirNameVal,
            email: heirEmailVal,
            "legacyHeir.status": "TRANSFERRED",
            "legacyHeir.transferredAt": new Date()
          }
        });
      }

      else if (request.type === "toggle-burnout") {
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        const nextState = !user.isBurnoutActive;
        await User.updateOne({ id: userId }, { $set: { isBurnoutActive: nextState } });
      }

      request.status = "approved";
      request.resolvedAt = new Date();
      await request.save();

      // Notify member
      const memberNotif = new Notification({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: request.userId,
        type: "system",
        title: "Master Blueprint Talebiniz Onaylandı",
        message: `Talep ettiğiniz ${request.type === 'insurance-grant' ? 'Sigorta Fonu Yardımı' : request.type === 'kardeslik-aid' ? 'Kardeşlik Yardımı' : request.type === 'assign-heir' ? 'Varis Değişikliği' : request.type === 'trigger-inheritance' ? 'Veraset Devri' : 'Burnout Mola'} talebi yönetici tarafından onaylandı ve uygulandı!`,
        createdAt: new Date()
      });
      await memberNotif.save();

      return res.json({ success: true, message: "Talep başarıyla onaylandı ve uygulandı." });
    }

    return res.status(400).json({ success: false, message: "Geçersiz işlem statüsü." });
  } catch (error: any) {
    console.error("Error resolving blueprint request:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Micro-Endpoint: POST /api/commissions/calculate-placement-bonuses
 * Processes pending placement approvals, activates users, and distributes sponsor bonuses.
 */
router.post("/calculate-placement-bonuses", async (req, res) => {
  try {
    const { sponsorId, newUserId } = req.body;
    if (!sponsorId || !newUserId) {
      return res.status(400).json({ success: false, error: "Sponsor ID ve New User ID gereklidir." });
    }

    // 1. Find the pending placement
    const { PendingPlacement } = await import("../lib/models");
    let placement = await PendingPlacement.findOne({ sponsorId, newUserId, status: "pending" });
    if (!placement) {
      // Fallback: try to find any pending placement for this new user
      placement = await PendingPlacement.findOne({ newUserId, status: "pending" });
    }

    // Update status to 'placed'
    if (placement) {
      placement.status = "placed";
      placement.updatedAt = new Date();
      await placement.save();
    }

    // 2. Load the sponsor and new user to apply bonuses
    const sponsor = await User.findOne({ id: sponsorId });
    const newUser = await User.findOne({ id: newUserId });

    if (!sponsor || !newUser) {
      return res.status(404).json({ success: false, error: "Sponsor veya yerleştirilen kullanıcı bulunamadı." });
    }

    // 3. Make newUser active and set sponsorId if not set
    if (!newUser.sponsorId || newUser.sponsorId === sponsorId) {
      newUser.sponsorId = sponsorId;
    }
    newUser.isActive = true;
    await newUser.save();

    // 4. Calculate sponsor bonus (usually $25)
    const sponsorBonusAmount = 25.0; // standard monoline placement sponsor bonus

    // Initialize wallet if needed
    if (!sponsor.wallet) {
      sponsor.wallet = { balance: 0, totalEarnings: 0, sponsorBonus: 0, careerBonus: 0, passiveIncome: 0, leadershipBonus: 0 };
    }

    sponsor.wallet.balance = (sponsor.wallet.balance || 0) + sponsorBonusAmount;
    sponsor.wallet.sponsorBonus = (sponsor.wallet.sponsorBonus || 0) + sponsorBonusAmount;
    sponsor.wallet.totalEarnings = (sponsor.wallet.totalEarnings || 0) + sponsorBonusAmount;
    await sponsor.save();

    // 5. Create wallet transaction
    const { WalletTransaction } = await import("../lib/models");
    const txId = "tx_" + Math.random().toString(36).substr(2, 9);
    const transaction = new WalletTransaction({
      id: txId,
      userId: sponsorId,
      amount: sponsorBonusAmount,
      type: "bonus",
      description: `Monoline Referans Onay Bonusu (${newUser.fullName})`,
      status: "completed",
      createdAt: new Date(),
      metadata: {
        sourceUserId: newUserId,
        type: "sponsor_bonus"
      }
    });
    await transaction.save();

    // 6. Create notifications
    const notif = new Notification({
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId: sponsorId,
      type: "commission",
      title: "Monoline Referans Bonusu!",
      message: `${newUser.fullName} adlı üyenizin onayıyla hesabınıza $${sponsorBonusAmount.toFixed(2)} USD referans bonusu aktarıldı.`,
      createdAt: new Date()
    });
    await notif.save();

    // Sync with memory database
    const { default: mongoDb } = await import("../lib/mongo-database");
    await mongoDb.syncUserToMongo(sponsor.toObject());
    await mongoDb.syncUserToMongo(newUser.toObject());

    // Clear caches
    const cache = await getCacheManager();
    await cache.delete(`user:eligibility:${sponsorId}`);
    await cache.delete(`user:challenges:${sponsorId}`);

    return res.json({
      success: true,
      totalAmount: sponsorBonusAmount,
      message: "Yerleştirme başarıyla tamamlandı ve sponsor bonusu aktarıldı."
    });
  } catch (error: any) {
    console.error("Error in calculate-placement-bonuses:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
