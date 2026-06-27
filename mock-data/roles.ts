import type { Role } from "@/types/role";

export const mockRoles: Role[] = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access to all modules, settings, and user management.",
    permissions: ["Manage Users", "All Branches", "Financial Reports", "System Settings", "Delete Records"],
    color: "var(--tf-danger-soft)",
    textColor: "var(--tf-danger)",
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "Branch-level management with access to sales and reports.",
    permissions: ["Manage Branch Staff", "View Reports", "Approve Expenses", "Manage Bookings"],
    color: "var(--tf-warning-soft)",
    textColor: "var(--tf-warning)",
  },
  {
    id: "role-agent",
    name: "Agent",
    description: "Create and manage leads, bookings, and customers.",
    permissions: ["Manage Leads", "Create Bookings", "View Customers", "Create Invoices"],
    color: "var(--tf-info-soft)",
    textColor: "var(--tf-info)",
  },
  {
    id: "role-accountant",
    name: "Accountant",
    description: "Financial operations, expenses, and reporting.",
    permissions: ["Financial Reports", "Manage Expenses", "View Reports", "Create Invoices"],
    color: "var(--tf-success-soft)",
    textColor: "var(--tf-success)",
  },
];
