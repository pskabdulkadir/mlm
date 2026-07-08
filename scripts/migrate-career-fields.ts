import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../server/lib/models";

dotenv.config();

async function runMigration() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/akn_group_mlm";
  console.log("Connecting to MongoDB for migration at:", uri);
  
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully to MongoDB.");

    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate.`);

    let migratedCount = 0;
    for (const user of users) {
      // Determine career level order from user's careerLevel object
      let careerLvl = 1;
      if (user.careerLevel && typeof user.careerLevel === "object") {
        careerLvl = (user.careerLevel as any).order || (user.careerLevel as any).level || 1;
      }

      const totalTeamCiro = user.totalTeamCiroTL || 0;
      const directRefs = user.directReferrals || 0;

      // Update the fields if they are missing or outdated
      user.career_level = careerLvl;
      user.total_team_ciro = totalTeamCiro;
      user.direct_references = directRefs;

      await user.save();
      migratedCount++;
    }

    console.log(`Migration completed successfully! ${migratedCount} users updated.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runMigration();
