export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  textColor: string;
}

export const ALL_PERMISSIONS = [
  "Manage Users",
  "All Branches",
  "Financial Reports",
  "System Settings",
  "Delete Records",
  "Manage Branch Staff",
  "View Reports",
  "Approve Expenses",
  "Manage Bookings",
  "Manage Leads",
  "Create Bookings",
  "View Customers",
  "Create Invoices",
  "Manage Expenses",
  "View Suppliers",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];
