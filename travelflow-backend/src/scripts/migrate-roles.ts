
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "../config/database";
import { Role } from "../models";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const permissionMap: Record<string, string[]> = {
  "dashboard:read": [], // Handled by standard access
  "leads:read": ["Leads: View"],
  "leads:write": ["Leads: Create", "Leads: Edit"],
  "leads:delete": ["Leads: Delete"],
  "customers:read": ["Customers: View"],
  "customers:write": ["Customers: Create", "Customers: Edit"],
  "bookings:read": ["Bookings: View"],
  "bookings:write": ["Bookings: Create", "Bookings: Edit"],
  "bookings:delete": ["Bookings: Delete"],
  "invoices:read": ["Invoices: View"],
  "invoices:write": ["Invoices: Create", "Invoices: Edit"],
  "invoices:delete": ["Invoices: Delete"],
  "receipts:read": [], // Moved to Expenses or handled otherwise
  "receipts:write": [],
  "receipts:delete": [],
  "expenses:read": ["Expenses: View"],
  "expenses:write": ["Expenses: Create", "Expenses: Edit"],
  "expenses:delete": ["Expenses: Delete"],
  "reports:read": ["Reports: View"],
  "users:read": ["Users: View"],
  "all": ["*"]
};

async function migrateRoles() {
  try {
    await connectDatabase();
    
    const roles = await Role.find({});
    let updatedCount = 0;
    
    for (const role of roles) {
      if (role.permissions.includes("*")) continue; // Skip admin
      
      const newPerms = new Set<string>();
      let hasOldFormat = false;
      
      for (const p of role.permissions) {
        if (p.includes(":read") || p.includes(":write") || p.includes(":delete") || p === "all") {
          hasOldFormat = true;
          const mapped = permissionMap[p] || [];
          mapped.forEach(mp => newPerms.add(mp));
        } else {
          newPerms.add(p); // keep already valid perms
        }
      }
      
      if (hasOldFormat) {
        // Specifically check for accountant to give them all 11 mapped exactly if needed, 
        // but the map above covers it. 
        if (role.name === "accountant") {
           // For accountant, we know they are supposed to have:
           // Invoices (View, Create, Edit, Delete) -> 4
           // Expenses (View, Create, Edit, Delete) -> 4
           // Reports (View) -> 1
           // That is 9, but in original script we had 11 (invoices read/write/delete + receipts read/write/delete + expenses read/write/delete + reports + dashboard).
           // Let's just override it to the exact new accountant permissions.
           role.permissions = [
              "Invoices: View", "Invoices: Create", "Invoices: Edit", "Invoices: Delete",
              "Expenses: View", "Expenses: Create", "Expenses: Edit", "Expenses: Delete",
              "Reports: View",
           ];
        } else {
           role.permissions = Array.from(newPerms);
        }
        
        await role.save();
        updatedCount++;
        console.log(`Migrated role ${role.name}`);
      }
    }
    
    console.log(`Successfully migrated ${updatedCount} roles.`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
}

migrateRoles();
