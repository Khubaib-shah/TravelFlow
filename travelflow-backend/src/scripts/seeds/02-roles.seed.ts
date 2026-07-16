import { Role } from "../../models";
import { Types } from "mongoose";

export async function seedRoles(agencyId: Types.ObjectId) {
  console.log("Seeding Roles...");

  const roleData = [
    {
      name: "admin",
      description: "Full system access including agency settings.",
      permissions: ["*"],
      color: "bg-red-100",
      textColor: "text-red-700",
    },
    {
      name: "manager",
      description: "Branch manager with access to all modules in their branch.",
      permissions: [
        "Leads: View", "Leads: Create", "Leads: Edit", "Leads: Delete",
        "Customers: View", "Customers: Create", "Customers: Edit", "Customers: Delete",
        "Bookings: View", "Bookings: Create", "Bookings: Edit", "Bookings: Delete",
        "Invoices: View", "Invoices: Create", "Invoices: Edit", "Invoices: Delete",
        "Expenses: View", "Expenses: Create", "Expenses: Edit", "Expenses: Delete",
        "Reports: View",
        "Users: View",
      ],
      color: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      name: "agent",
      description: "Travel consultant who manages leads, customers, and bookings.",
      permissions: [
        "Leads: View", "Leads: Create", "Leads: Edit",
        "Customers: View", "Customers: Create", "Customers: Edit",
        "Bookings: View", "Bookings: Create", "Bookings: Edit",
        "Invoices: View", "Invoices: Create",
      ],
      color: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      name: "accountant",
      description: "Financial access for invoices, receipts, and expenses.",
      permissions: [
        "Invoices: View", "Invoices: Create", "Invoices: Edit", "Invoices: Delete",
        "Expenses: View", "Expenses: Create", "Expenses: Edit", "Expenses: Delete",
        "Reports: View",
      ],
      color: "bg-purple-100",
      textColor: "text-purple-700",
    },
    {
      name: "support",
      description: "Support staff with view-only or limited operational access.",
      permissions: [
        "Leads: View",
        "Customers: View",
        "Bookings: View",
      ],
      color: "bg-gray-100",
      textColor: "text-gray-700",
    },
  ];

  const roles = await Role.insertMany(
    roleData.map((r) => ({ ...r, agencyId }))
  );

  return roles;
}
