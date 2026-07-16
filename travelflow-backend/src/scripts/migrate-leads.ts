import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "../config/database";
import { Lead } from "../models";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function migrateLeads() {
  try {
    console.log("Connecting to database...");
    await connectDatabase();
    
    console.log("Migrating leads status...");
    
    const r1 = await Lead.updateMany({ status: "follow-up" }, { $set: { status: "follow_up" } });
    console.log(`Updated ${r1.modifiedCount} leads from follow-up to follow_up`);
    
    const r2 = await Lead.updateMany({ status: "quoted" }, { $set: { status: "negotiation" } });
    console.log(`Updated ${r2.modifiedCount} leads from quoted to negotiation`);
    
    const r3 = await Lead.updateMany({ status: "won" }, { $set: { status: "converted" } });
    console.log(`Updated ${r3.modifiedCount} leads from won to converted`);
    
    const r4 = await Lead.updateMany({ status: "cancelled" }, { $set: { status: "lost" } });
    console.log(`Updated ${r4.modifiedCount} leads from cancelled to lost`);
    
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateLeads();
