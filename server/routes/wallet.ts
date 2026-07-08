import { Router } from "express";
import { mongoDb } from "../lib/mongo-database";
import { verifyAccessToken } from "../lib/utils";

const router = Router();

// Robust authentication middleware
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
    console.error("Authentication error in wallet route:", err);
    return res.status(401).json({ success: false, error: "Yetkilendirme hatası." });
  }
}

// Admin authentication middleware
async function getAdminUser(req: any, res: any, next: any) {
  getAuthenticatedUser(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Bu işlem için admin yetkileri gereklidir." });
    }
    next();
  });
}

// 1. Balances
router.get("/balances", getAuthenticatedUser, async (req: any, res) => {
  try {
    const balances = await mongoDb.getUserWalletBalances(req.userId);
    res.json({ success: true, balances });
  } catch (error) {
    console.error("Error fetching balances:", error);
    res.status(500).json({ success: false, error: "Bakiye bilgileri alınamadı." });
  }
});

// 2. Transactions
router.get("/transactions", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { transactions } = await mongoDb.getUserWalletTransactions(req.userId);
    res.json({ success: true, transactions: transactions || [] });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, error: "İşlemler alınamadı." });
  }
});

// 3. Deposit request
router.post("/deposit", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { amount, currency, paymentMethod, reference, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Geçersiz miktar." });
    }

    // Create a deposit transaction with pending status
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const tx = await mongoDb.createWalletTransaction({
      id: transactionId,
      userId: req.userId,
      amount,
      currency: currency || "USD",
      type: "deposit",
      status: "pending",
      reference: reference || `DEP-${Date.now()}`,
      description: notes || "E-Wallet deposit request",
    });

    // Auto-approve the deposit as requested by the frontend and stated in the notification alert
    await mongoDb.processDepositRequest(transactionId, "system", "approve", "Auto-approved E-Wallet investment");

    res.json({ success: true, transaction: tx });
  } catch (error) {
    console.error("Error processing deposit:", error);
    res.status(500).json({ success: false, error: "Para yatırma işlemi gerçekleştirilemedi." });
  }
});

// 4. Withdrawal request
router.post("/withdraw", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { amount, currency, bankAccount, notes } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Geçersiz miktar." });
    }

    const user = await mongoDb.getUserById(req.userId);
    if (!user || (user.wallet?.balance || 0) < amount) {
      return res.status(400).json({ success: false, error: "Yetersiz bakiye." });
    }

    // Deduct from wallet balance
    await mongoDb.incrementWalletBalance(req.userId, -amount, "balance");

    // Create withdrawal transaction
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const tx = await mongoDb.createWalletTransaction({
      id: transactionId,
      userId: req.userId,
      amount,
      type: "withdrawal",
      status: "pending",
      reference: bankAccount?.iban || `WITH-${Date.now()}`,
      description: notes || `E-Wallet withdrawal to ${bankAccount?.accountHolder || ''}`,
    });

    res.json({ success: true, transaction: tx });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ success: false, error: "Para çekme talebi oluşturulamadı." });
  }
});

// 5. Transfer request
router.post("/transfer", getAuthenticatedUser, async (req: any, res) => {
  try {
    const { targetMemberId, amount, description } = req.body;
    const transferAmount = parseFloat(amount);
    if (!targetMemberId || isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ success: false, error: "Geçersiz alıcı veya miktar." });
    }

    const sender = await mongoDb.getUserById(req.userId);
    if (!sender) {
      return res.status(404).json({ success: false, error: "Gönderici bulunamadı." });
    }

    if ((sender.wallet?.balance || 0) < transferAmount) {
      return res.status(400).json({ success: false, error: "Yetersiz bakiye." });
    }

    const receiver = await mongoDb.getUserByMemberId(targetMemberId);
    if (!receiver) {
      return res.status(404).json({ success: false, error: "Alıcı kullanıcı bulunamadı." });
    }

    if (receiver.id === sender.id) {
      return res.status(400).json({ success: false, error: "Kendinize transfer yapamazsınız." });
    }

    // Process transfer balance updates
    await mongoDb.incrementWalletBalance(sender.id, -transferAmount, "balance");
    await mongoDb.incrementWalletBalance(receiver.id, transferAmount, "balance");

    // Create transaction for sender
    const txIdSender = `tx-${Date.now()}-send-${Math.random().toString(36).slice(2, 6)}`;
    await mongoDb.createWalletTransaction({
      id: txIdSender,
      userId: sender.id,
      amount: -transferAmount,
      type: "transfer",
      status: "completed",
      reference: receiver.memberId || targetMemberId,
      description: description || `${targetMemberId} kullanıcısına transfer`,
    });

    // Create transaction for receiver
    const txIdReceiver = `tx-${Date.now()}-recv-${Math.random().toString(36).slice(2, 6)}`;
    await mongoDb.createWalletTransaction({
      id: txIdReceiver,
      userId: receiver.id,
      amount: transferAmount,
      type: "transfer",
      status: "completed",
      reference: sender.memberId || "system",
      description: description || `${sender.memberId || sender.fullName} kullanıcısından gelen transfer`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing transfer:", error);
    res.status(500).json({ success: false, error: "Transfer işlemi gerçekleştirilemedi." });
  }
});

// 6. Admin pending transactions
router.get("/admin/pending", getAdminUser, async (req: any, res) => {
  try {
    const transactions = await mongoDb.getPendingWalletTransactions();
    res.json({ success: true, transactions: transactions || [] });
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    res.status(500).json({ success: false, error: "Bekleyen işlemler alınamadı." });
  }
});

// 7. Admin approve/reject deposit
router.put("/admin/deposits/:transactionId", getAdminUser, async (req: any, res) => {
  try {
    const { transactionId } = req.params;
    const { action, note } = req.body;
    
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ success: false, error: "Geçersiz eylem." });
    }

    const result = await mongoDb.processDepositRequest(
      transactionId, 
      req.userId, 
      action, 
      note || `Admin ${action === 'approve' ? 'onayı' : 'reddi'}`
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, transaction: result.transaction });
  } catch (error) {
    console.error("Error processing admin deposit:", error);
    res.status(500).json({ success: false, error: "Eylem gerçekleştirilemedi." });
  }
});

// 8. Admin approve/reject withdrawal
router.put("/admin/withdrawals/:transactionId", getAdminUser, async (req: any, res) => {
  try {
    const { transactionId } = req.params;
    const { action, note } = req.body;
    
    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ success: false, error: "Geçersiz eylem." });
    }

    const result = await mongoDb.processWithdrawalRequest(
      transactionId, 
      req.userId, 
      action, 
      note || `Admin ${action === 'approve' ? 'onayı' : 'reddi'}`
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, transaction: result.transaction });
  } catch (error) {
    console.error("Error processing admin withdrawal:", error);
    res.status(500).json({ success: false, error: "Eylem gerçekleştirilemedi." });
  }
});

router.get("/", (req, res) => {
  res.json({ success: true, wallet: { balance: 0, earnings: 0 } });
});

export default router;
