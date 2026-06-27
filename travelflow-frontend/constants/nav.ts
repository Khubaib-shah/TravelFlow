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
  LucideIcon
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
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
      },
      {
        title: "Users",
        href: "/users",
        icon: UserCog,
      },
      {
        title: "Roles",
        href: "/roles",
        icon: ShieldCheck,
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
      },
    ],
  },
];
