import {
  LayoutDashboard,
  UserPlus,
  Users,
  Plane,
  FileText,
  Receipt,
  Building2,
  CreditCard,
  BarChart3,
  GitBranch,
  UserCog,
  ShieldCheck,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const sidebarNav: NavGroup[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        title: "Leads",
        href: "/leads",
        icon: UserPlus,
        badge: "12 new",
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
    ],
  },
  {
    label: "SALES",
    items: [
      {
        title: "Bookings",
        href: "/bookings",
        icon: Plane,
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText,
      },
      {
        title: "Receipts",
        href: "/receipts",
        icon: Receipt,
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Building2,
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: CreditCard,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      {
        title: "Branches",
        href: "/branches",
        icon: GitBranch,
        roles: ["admin", "manager"],
      },
      {
        title: "Users",
        href: "/users",
        icon: UserCog,
        roles: ["admin", "manager"],
      },
      {
        title: "Roles",
        href: "/roles",
        icon: ShieldCheck,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    label: "SALES DOCUMENTS",
    items: [
      {
        title: "Quotations",
        href: "/quotations",
        icon: FileText,
        roles: ["admin", "manager"],
      },
    ],
  },
];
