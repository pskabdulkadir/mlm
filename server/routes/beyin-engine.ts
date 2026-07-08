import express from "express";
import { User, WalletTransaction, ProductPurchase } from "../lib/models";
import { MlmEngineBridge } from "../../src/core/engine/MlmEngineBridge";

const router = express.Router();

// Get real ledger data for points and payouts
router.get("/ledger/data", async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({
      reference: { $regex: /^(PAYOUT-|COMM-|PURCHASE-)/ }
    }).sort({ createdAt: -1 });

    const payouts = transactions.map(t => {
      const parts = t.reference.split("-");
      const saleId = parts[1] || "S-OTONOM";
      return {
        id: t._id.toString(),
        user_id: t.userId,
        sale_id: saleId,
        amount: t.amount,
        model_type: t.type === "SPONSOR" ? "UNILEVEL" : t.type,
        rule_details: t.description || "Otonom kazanç dağıtımı.",
        timestamp: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString()
      };
    });

    const purchases = await ProductPurchase.find({}).sort({ date: -1 });
    const pointsLog = purchases.map((p: any) => ({
      id: p._id?.toString() || p.id,
      user_id: p.userId,
      sale_id: p.id || "S-OTONOM",
      pv_amount: p.totalAmount,
      product_name: p.productId || "Ürün Satın Alımı",
      amount: p.totalAmount,
      timestamp: p.approvedAt ? p.approvedAt.toISOString() : (p.date ? p.date.toISOString() : new Date().toISOString())
    }));

    res.json({ payouts, pointsLog });
  } catch (error: any) {
    console.error("Error in /ledger/data:", error);
    res.status(500).json({ error: error.message });
  }
});

// 1. GET /api/transaction-logs
router.get("/transaction-logs", async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(50);
    
    const logs = transactions.map((t, idx) => ({
      id: t._id?.toString() || `log-${idx}`,
      timestamp: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
      level: "INFO",
      message: `[PAYOUT] User ${t.userId} received $${t.amount} via ${t.type}. Source User: ${t.sourceUserId || "System"}. Ref: ${t.reference}`,
      details: t.description || "Otonom kazanç dağıtımı."
    }));

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/closures
router.get("/closures", async (req, res) => {
  try {
    const users = await User.find({});
    const closures: any[] = [];

    // Build unilevel closure paths dynamically based on sponsorId
    for (const u of users) {
      let ancestorId = u.sponsorId;
      let depth = 1;
      
      // Self closure
      closures.push({
        ancestor_id: u.id || u._id.toString(),
        descendant_id: u.id || u._id.toString(),
        depth: 0
      });

      const visited = new Set<string>();
      while (ancestorId) {
        if (visited.has(ancestorId)) break;
        visited.add(ancestorId);

        closures.push({
          ancestor_id: ancestorId,
          descendant_id: u.id || u._id.toString(),
          depth: depth
        });

        const ancestor = users.find(x => (x.id || x._id.toString()) === ancestorId);
        ancestorId = ancestor?.sponsorId || null;
        depth++;
      }
    }

    res.json(closures);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/sql-schema
router.get("/sql-schema", (req, res) => {
  const ddl = `
-- MLM Autonomous Engine Schema (PostgreSQL)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    parent_id VARCHAR(255) REFERENCES users(id),
    upline_id VARCHAR(255) REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    personal_pv NUMERIC(15, 2) DEFAULT 0.00,
    career_level INT DEFAULT 1,
    direct_references INT DEFAULT 0,
    total_team_ciro NUMERIC(15, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS closures (
    ancestor_id VARCHAR(255) REFERENCES users(id),
    descendant_id VARCHAR(255) REFERENCES users(id),
    depth INT NOT NULL,
    PRIMARY KEY (ancestor_id, descendant_id)
);

CREATE TABLE IF NOT EXISTS points_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    sale_id VARCHAR(255) NOT NULL,
    pv_amount NUMERIC(15, 2) NOT NULL,
    source_user_id VARCHAR(255) REFERENCES users(id),
    depth INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    sale_id VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    rule_details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;
  res.json({ sql: ddl });
});

// 4. POST /api/payouts/calculate
router.post("/payouts/calculate", async (req, res) => {
  try {
    const { sale_id, user_id, amount, model_type, product_name } = req.body;
    
    if (!user_id || !amount) {
      return res.status(400).json({ error: "Missing user_id or amount." });
    }

    const payload = {
      saleId: sale_id || `S-${Date.now().toString().slice(-6)}`,
      buyerUserId: user_id,
      amount: Number(amount),
      modelType: (model_type || "unilevel") as "unilevel" | "matrix" | "monoline",
      productName: product_name || "Otonom Test Satışı",
    };

    const response = await MlmEngineBridge.calculateAndApplyPayout(payload);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /api/config and POST /api/config
let formulaConfigMemory = {
  unilevel: {
    levels: [
      { depth: 1, percent: 10 },
      { depth: 2, percent: 5 },
      { depth: 3, percent: 3 },
      { depth: 4, percent: 2 },
      { depth: 5, percent: 1 },
    ]
  }
};

router.get("/config", (req, res) => {
  res.json(formulaConfigMemory);
});

router.post("/config", (req, res) => {
  try {
    formulaConfigMemory = { ...formulaConfigMemory, ...req.body };
    res.json({ status: "success", config: formulaConfigMemory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. POST /api/reset
router.post("/reset", async (req, res) => {
  try {
    // Safely clear test-related transactions and reset user volumes
    await WalletTransaction.deleteMany({ reference: { $regex: /^PAYOUT-/ } });
    await User.updateMany({}, {
      $set: {
        teamTurnoverUSD: 0,
        total_team_ciro: 0,
        career_level: 1,
        careerLevel: {
          name: "Mülhime",
          displayName: "Mülhime (Level 1)",
          order: 1,
          level: 1
        }
      }
    });

    res.json({ status: "success", message: "System test balances reset successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
