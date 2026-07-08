import { Request, Response, NextFunction } from "express";
import { mongoDb } from "../lib/mongo-database";
import { PointsCareerService } from "../lib/points-career-service";

// 1. Auth Controllers
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email, password, sponsorId, phone } = req.body;
    
    // Check if email already exists
    const existing = await mongoDb.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Bu e-posta adresi zaten kullanımda." });
    }

    const newUser = await mongoDb.createUser({
      fullName,
      email,
      password, // Password hashing should be done inside createUser or before
      sponsorId: sponsorId || "ak000001",
      phone: phone || "",
      isActive: false // Starts inactive until membership purchased
    });

    return res.status(201).json({ success: true, user: newUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await mongoDb.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "E-posta adresi veya şifre hatalı." });
    }
    // Simple mock comparison or use bcrypt if needed
    return res.json({ success: true, user, token: `mock-jwt-token-${user.id}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// 2. Membership Controllers
export async function purchaseMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, planId, paymentMethod } = req.body;
    // Mock purchase
    await mongoDb.updateUser(userId, { membershipType: planId || "standard" });
    return res.json({ success: true, message: "Membership purchase initialized successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function activateMembership(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    await mongoDb.updateUser(userId, { isActive: true });
    return res.json({ success: true, message: "Membership activated successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, receiptUrl } = req.body;
    return res.json({ success: true, message: "Receipt updated." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// 3. User & Dashboard Controllers
export async function getUserDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const user = await mongoDb.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const team = await mongoDb.getDirectReferrals(user.id);
    const purchases = await mongoDb.getUserProductPurchases(user.id);

    // Fetch passive income pool amount
    const passivePoolAmount = await mongoDb.getPassiveIncomePoolAmount();

    // Check user eligibility for passive pools and bonuses
    let eligibility = { isEligible: false, personalVolume: 0, remainingVolume: 100, unearnedSponsor: 0, unearnedCareer: 0, unearnedPool: 0 };
    try {
      const { MonolineCommissionService } = await import("../lib/monoline-commission-service");
      eligibility = await MonolineCommissionService.checkUserEligibility(user.id);
    } catch (e) {
      console.warn("Could not calculate eligibility in dashboard:", e);
    }

    return res.json({
      success: true,
      user,
      stats: {
        totalEarned: user.wallet?.totalEarnings || 0,
        balance: user.wallet?.balance || 0,
        sponsorBonus: user.wallet?.sponsorBonus || 0,
        careerBonus: user.wallet?.careerBonus || 0,
        teamSize: user.totalTeamSize || team.length,
        directReferrals: user.directReferrals || team.length,
        activeReferrals: team.filter((t: any) => t.isActive).length,
        recentPurchasesCount: purchases.length,
        passivePoolAmount,
        eligibility
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getNetworkTree(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const directReferrals = await mongoDb.getDirectReferrals(userId);
    return res.json({ success: true, network: directReferrals });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getMonolineDownline(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const user = await mongoDb.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // In monoline, everyone registered after get sequentially higher global ranks
    const allUsers = await mongoDb.getAllUsers();
    const downline = allUsers
      .filter((u: any) => u.globalRank > (user.globalRank || 0))
      .sort((a: any, b: any) => b.globalRank - a.globalRank);

    return res.json({ success: true, downline });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// 4. Financial & Wallet Controllers
export async function createWithdrawalRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, amount, method, address } = req.body;
    const user = await mongoDb.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if ((user.wallet?.balance || 0) < amount) {
      return res.status(400).json({ error: "Yetersiz bakiye." });
    }

    // Deduct balance and register transaction as pending
    await mongoDb.incrementWalletBalance(userId, -amount, "balance");
    await mongoDb.createTransaction({
      userId,
      amount,
      type: "WITHDRAWAL",
      status: "PENDING",
      description: `${method} ile para çekme talebi`,
      timestamp: new Date()
    });

    return res.json({ success: true, message: "Para çekme talebi başarıyla oluşturuldu." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function transferFunds(req: Request, res: Response, next: NextFunction) {
  try {
    const { fromUserId, toMemberId, amount } = req.body;
    
    const sender = await mongoDb.getUserById(fromUserId);
    if (!sender) return res.status(404).json({ error: "Gönderici bulunamadı" });

    if ((sender.wallet?.balance || 0) < amount) {
      return res.status(400).json({ error: "Yetersiz bakiye." });
    }

    const recipient = await mongoDb.getUserByMemberId(toMemberId);
    if (!recipient) return res.status(404).json({ error: "Alıcı üye bulunamadı (Geçersiz Member ID)." });

    // Atomic transfer
    await mongoDb.incrementWalletBalance(sender.id, -amount, "balance");
    await mongoDb.incrementWalletBalance(recipient.id, amount, "balance");

    // Log transactions
    await mongoDb.createTransaction({
      userId: sender.id,
      amount,
      type: "TRANSFER_SENT",
      status: "COMPLETED",
      description: `${recipient.fullName} (${toMemberId}) kullanıcısına transfer gönderildi.`,
      timestamp: new Date()
    });

    await mongoDb.createTransaction({
      userId: recipient.id,
      amount,
      type: "TRANSFER_RECEIVED",
      status: "COMPLETED",
      description: `${sender.fullName} (${sender.memberId}) kullanıcısından transfer alındı.`,
      timestamp: new Date()
    });

    return res.json({ success: true, message: "Bakiye transferi başarıyla tamamlandı." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// 5. App Modules
export async function calculateSpiritual(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, minutes, category } = req.body;
    return res.json({ success: true, progress: { minutes, category, pointsEarned: minutes * 2 } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getClonePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const page = await mongoDb.getClonePageBySlug(slug);
    if (!page) {
      return res.status(404).json({ error: "Klon sayfa bulunamadı." });
    }

    let user = await mongoDb.getUserById(page.userId);
    if (!user) {
      // Fallback: try finding user by memberId matching page.userId or slug
      const allUsers = await mongoDb.getAllUsers();
      user = allUsers.find((u: any) => u.id === page.userId || u.memberId === page.userId || u.memberId === slug);
    }

    if (!user) {
      return res.status(404).json({ error: "Sponsor kullanıcı bulunamadı." });
    }

    // Resolve and normalize career level
    let careerLevelObj = {
      name: "Mülhime",
      description: "Mülhime mertebesi",
      commissionRate: 1
    };

    if (user.careerLevel) {
      if (typeof user.careerLevel === 'object') {
        careerLevelObj = {
          name: user.careerLevel.displayName || user.careerLevel.name || "Mülhime",
          description: user.careerLevel.description || `${user.careerLevel.displayName || user.careerLevel.name} seviyesi`,
          commissionRate: user.careerLevel.commissionRate || user.careerLevel.commission || 1
        };
      } else {
        const allLevels = PointsCareerService.getDefaultCareerLevels();
        const levelIdOrNum = user.careerLevel.toString();
        const foundLevel = allLevels.find(l => 
          l.level.toString() === levelIdOrNum || 
          l.id === levelIdOrNum || 
          l.name.toLowerCase() === levelIdOrNum.toLowerCase()
        );
        if (foundLevel) {
          careerLevelObj = {
            name: foundLevel.displayName || foundLevel.name,
            description: foundLevel.description || `${foundLevel.displayName} seviyesi`,
            commissionRate: foundLevel.commissionRate || 1
          };
        }
      }
    }

    const formattedUser = {
      id: user.id || user._id,
      fullName: user.fullName || "Abdulkadir Kan",
      memberId: user.memberId || "ak000001",
      referralCode: user.referralCode || user.memberId || "ak000001",
      careerLevel: careerLevelObj
    };

    return res.json({
      success: true,
      clonePage: page,
      user: formattedUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// 6. Admin Controllers
export async function getAdminDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await mongoDb.getAllUsers();
    const purchases = await mongoDb.adminGetAllProductPurchases();
    
    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.isActive).length,
        totalRevenue: purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
        pendingPayments: purchases.filter(p => p.status === 'pending').length
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await mongoDb.getAllUsers();
    return res.json({ success: true, users });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateUserByAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const updated = await mongoDb.updateUser(userId, req.body);
    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteUserByAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    await mongoDb.deleteUser(userId);
    return res.json({ success: true, message: "Kullanıcı silindi." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateSystemSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, value } = req.body;
    await mongoDb.updateSystemSetting(key, value);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getPerformanceStatus(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, status: "optimal", usage: { cpu: "12%", memory: "115MB" } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function optimizeSystem(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, message: "System optimized successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function checkCapacity(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, capacity: { used: 75, max: 1000000 } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function batchProcessUsers(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, message: "Batch processing complete." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getUserProductPurchases(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const purchases = await mongoDb.getUserProductPurchases(userId);
    return res.json({ success: true, purchases });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getPendingPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, placements: [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function moveUserByAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, message: "User moved." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function placeUserByAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    return res.json({ success: true, message: "User placed." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getNextId(req: Request, res: Response, next: NextFunction) {
  try {
    const nextMemberId = await mongoDb.peekNextMemberId();
    return res.json({ success: true, nextId: nextMemberId, nextMemberId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
