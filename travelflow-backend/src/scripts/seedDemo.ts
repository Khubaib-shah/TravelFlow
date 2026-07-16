import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "../config/database";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { seedAgencyAndBranches } from "./seeds/01-agency.seed";
import { seedRoles } from "./seeds/02-roles.seed";
import { seedUsers } from "./seeds/03-users.seed";
import { seedSuppliers } from "./seeds/04-suppliers.seed";
import { seedCustomers } from "./seeds/05-customers.seed";
import { seedLeads } from "./seeds/06-leads.seed";
import { seedQuotations } from "./seeds/07-quotations.seed";
import { seedBookings } from "./seeds/08-bookings.seed";
import { seedFinance } from "./seeds/09-finance.seed";
import { seedActivityAndNotifications } from "./seeds/10-activity.seed";

async function runDemoSeed() {
  try {
    console.log("Connecting to Database...");
    await connectDatabase();

    console.log("Wiping existing database collections...");
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log("Database wiped successfully.");
    }

    console.log("==========================================");
    console.log("STARTING TRIP TRAILS DEMO DATA GENERATION");
    console.log("==========================================");

    // Step 1: Agency & Branches
    const { agency, branches } = await seedAgencyAndBranches();
    console.log(`✅ Agency & Branches created`);

    // Step 2: Roles
    const roles = await seedRoles(agency._id);
    console.log(`✅ ${roles.length} Roles created`);

    // Step 3: Users
    const users = await seedUsers(agency._id, branches, roles);
    console.log(`✅ ${users.length} Users created`);

    // Step 4: Suppliers
    const suppliers = await seedSuppliers(agency._id);
    console.log(`✅ ${suppliers.length} Suppliers created`);

    // Step 5: Customers
    const customers = await seedCustomers(agency._id);
    console.log(`✅ ${customers.length} Customers created`);

    // Step 6: Leads
    const leads = await seedLeads(agency._id, branches, users);
    console.log(`✅ ${leads.length} Leads created`);

    // Step 7: Quotations
    const quotations = await seedQuotations(agency._id, branches, users, customers, leads);
    console.log(`✅ ${quotations.length} Quotations created`);

    // Step 8: Bookings
    const bookings = await seedBookings(agency._id, branches, users, customers, suppliers, leads);
    console.log(`✅ ${bookings.length} Bookings created`);

    // Step 9: Finance (Invoices, Receipts, Expenses)
    await seedFinance(agency._id, branches, users, bookings);
    console.log(`✅ Finance Data created`);

    // Step 10: Activity Logs & Notifications
    await seedActivityAndNotifications(agency._id, branches, users);
    console.log(`✅ Activity Logs created`);

    console.log("==========================================");
    console.log("DEMO DATA GENERATION COMPLETED SUCCESSFULLY");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error generating demo data:", error);
    process.exit(1);
  }
}

runDemoSeed();
