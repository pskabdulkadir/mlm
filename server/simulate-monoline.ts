import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { mongoDb } from "./lib/mongo-database";
import { fulfillProductPurchase } from "./lib/purchase-fulfillment";

// Load environment variables
dotenv.config();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runSimulation() {
  console.log("🚀 =====================================================");
  console.log("🚀 STARTING AKN GROUP MONOLINE SYSTEM SIMULATION");
  console.log("🚀 =====================================================\n");

  try {
    // 1. Initialize DB
    await mongoDb.init();
    
    // Find the primary Admin to act as root sponsor for the tree
    const adminUser = await mongoDb.getUserByEmail("psikologabdulkadirkan@gmail.com");
    if (!adminUser) {
      console.error("❌ Root Admin user (psikologabdulkadirkan@gmail.com) not found in DB. Please register one first.");
      process.exit(1);
    }
    console.log(`🔑 Root Sponsor: Admin ${adminUser.fullName} (ID: ${adminUser.memberId})`);

    // 2. Clear previous test users to ensure clean simulation
    console.log("🧹 Clearing old test users...");
    const clearedCount = await mongoDb.deleteTestUsers();
    console.log(`🧹 Cleared ${clearedCount} old test users.\n`);

    // We will create 200 test users
    const TARGET_USER_COUNT = 200;
    const testUsers: any[] = [];
    
    console.log(`👥 Creating ${TARGET_USER_COUNT} test users with realistic hierarchical structure...`);
    
    for (let i = 1; i <= TARGET_USER_COUNT; i++) {
      const email = `testuye${i}@example.com`;
      const fullName = `Test Üye ${i}`;
      const phone = `+90555000${String(i).padStart(4, "0")}`;
      const password = "test123456"; // simple plain password (will be hashed in adminCreateUser)

      // Establish Sponsor:
      // User 1 sponsored by Root Admin
      // User i sponsored by testuye_floor((i-2)/3)+1
      let sponsorCode = adminUser.memberId;
      let sponsorId = adminUser.id;

      if (i > 1) {
        const parentIndex = Math.floor((i - 2) / 3); // 3 children per sponsor
        const parentUser = testUsers[parentIndex];
        if (parentUser) {
          sponsorCode = parentUser.memberId;
          sponsorId = parentUser.id;
        }
      }

      // Create user
      const result = await mongoDb.adminCreateUser({
        fullName,
        email,
        phone,
        password,
        role: "member",
        sponsorId,
        isActive: true,
        membershipType: "entry",
        initialBalance: 0
      });

      if (!result.success || !result.user) {
        console.error(`❌ Failed to create Test User ${i}:`, (result as any).error);
        continue;
      }

      const newUser = result.user;
      testUsers.push(newUser);

      if (i % 25 === 0 || i === TARGET_USER_COUNT) {
        console.log(`✔️ Created ${i}/${TARGET_USER_COUNT} test users...`);
      }
    }

    console.log(`\n✅ Created exactly ${testUsers.length} test users in a Ternary Tree hierarchy.\n`);

    // 3. Simulate Product Purchases
    console.log("💰 Simulating purchases for the test users...");
    // Products available in the system:
    // 1. prod-1781730227839: Aylık Aktiflik Paketi ($20)
    // 2. prod-1781730227854: Yıllık Aktiflik Paketi ($200)
    // 3. prod-1781730227870: Manevi Rehber – Bölüm 1 ($100)
    
    const productsList = [
      { id: "prod-1781730227839", name: "Aylık Aktiflik Paketi", price: 20 },
      { id: "prod-1781730227854", name: "Yıllık Aktiflik Paketi", price: 200 },
      { id: "prod-1781730227870", name: "Manevi Rehber – Bölüm 1", price: 100 }
    ];

    let purchaseSuccessCount = 0;
    let purchaseFailCount = 0;

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      // Select product based on index to distribute purchases across $20, $100, $200
      const prodSelect = i % 3;
      const product = productsList[prodSelect];

      const result = await fulfillProductPurchase({
        productId: product.id,
        buyerEmail: user.email,
        userId: user.id,
        shippingAddress: { country: "Turkey", city: "Istanbul" },
        paymentMethod: "stripe_mock",
        totalAmount: product.price
      });

      if (result.success) {
        purchaseSuccessCount++;
      } else {
        purchaseFailCount++;
        console.error(`❌ Purchase failed for ${user.fullName}:`, result.error);
      }

      if ((i + 1) % 25 === 0 || i === testUsers.length - 1) {
        console.log(`🛒 Processed ${i + 1}/${testUsers.length} purchases...`);
        // Add a slight delay to let DB process async transactions stably
        await delay(50);
      }
    }

    console.log(`\n✅ Purchases complete! Success: ${purchaseSuccessCount}, Fails: ${purchaseFailCount}\n`);

    // 4. Fetch Results and Statistics for reporting
    console.log("📊 Analyzing results from database...");
    
    // Total users in DB now
    const allUsersCount = await mongoose.connection.db.collection("users").countDocuments();
    const activeUsersCount = await mongoose.connection.db.collection("users").countDocuments({ isActive: true });
    
    // Career level distribution
    const users = await mongoose.connection.db.collection("users").find({}).toArray();
    const careerStats: Record<string, number> = {};
    
    // Wallet earnings
    let totalWalletEarnings = 0;
    let totalWalletBalances = 0;
    
    users.forEach(u => {
      const cName = u.careerLevel?.name || "Nefs-i Emmare";
      careerStats[cName] = (careerStats[cName] || 0) + 1;
      
      totalWalletBalances += (u.wallet?.balance || 0);
      totalWalletEarnings += (u.wallet?.totalEarnings || 0);
    });

    // Count transaction types
    const txCollection = mongoose.connection.db.collection("wallettransactions");
    const totalTxCount = await txCollection.countDocuments();
    const sponsorTxCount = await txCollection.countDocuments({ type: "SPONSOR" });
    const careerTxCount = await txCollection.countDocuments({ type: "CAREER" });
    const unilevelTxCount = await txCollection.countDocuments({ type: { $in: ["depth", "UNILEVEL"] } }); // or DEPTH

    console.log("\n=====================================================");
    console.log("📊 SIMULATION REPORT & SYSTEM DIAGNOSTICS");
    console.log("=====================================================");
    console.log(`👥 Toplam Kullanıcı Sayısı (Sistemde): ${allUsersCount}`);
    console.log(`🟢 Aktif Kullanıcı Sayısı: ${activeUsersCount}`);
    console.log(`📦 Başarıyla Oluşturulan Test Kullanıcısı: ${testUsers.length}`);
    console.log(`💰 Toplam Üye Cüzdan Bakiyeleri: $${totalWalletBalances.toFixed(2)}`);
    console.log(`💵 Toplam Dağıtılan Kazanç: $${totalWalletEarnings.toFixed(2)}`);
    console.log(`📝 Toplam Cüzdan Hareketi Sayısı: ${totalTxCount}`);
    console.log(`   - Direkt Sponsor Ödemeleri: ${sponsorTxCount}`);
    console.log(`   - Kariyer / Derinlik Limit Ödemeleri: ${careerTxCount}`);
    console.log("\n📈 Kariyer Dağılımları (Career Levels):");
    Object.entries(careerStats).forEach(([level, count]) => {
      console.log(`   ⭐ ${level}: ${count} kişi`);
    });
    console.log("=====================================================\n");

    console.log("🏁 Simulation finished successfully.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Fatal Simulation Error:", error);
    process.exit(1);
  }
}

runSimulation();
