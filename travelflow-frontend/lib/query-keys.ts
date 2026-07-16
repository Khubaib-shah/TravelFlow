export const queryKeys = {
  // --- Dashboard ---
  dashboard: {
    all: ["dashboard"] as const,
    stats: (branchId: string | null) => ["dashboard", "stats", branchId] as const,
  },

  // --- Shared / Master Data ---
  shared: {
    all: ["shared"] as const,
    branches: () => ["shared", "branches"] as const,
    roles: () => ["shared", "roles"] as const,
    users: () => ["shared", "users"] as const,
    agents: () => ["shared", "agents"] as const,
  },

  // --- Customers ---
  customers: {
    all: ["customers"] as const,
    list: (filters: Record<string, any>) => ["customers", "list", filters] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
  },

  // --- Bookings ---
  bookings: {
    all: ["bookings"] as const,
    list: (filters: Record<string, any>) => ["bookings", "list", filters] as const,
    recent: (branchId: string | null) => ["bookings", "recent", branchId] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },

  // --- Leads ---
  leads: {
    all: ["leads"] as const,
    list: (filters: Record<string, any>) => ["leads", "list", filters] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },

  // --- Quotations ---
  quotations: {
    all: ["quotations"] as const,
    list: (filters: Record<string, any>) => ["quotations", "list", filters] as const,
    detail: (id: string) => ["quotations", "detail", id] as const,
  },

  // --- Finance ---
  finance: {
    all: ["finance"] as const,
    expenses: {
      list: (filters: Record<string, any>) => ["finance", "expenses", "list", filters] as const,
    },
    receipts: {
      list: (filters: Record<string, any>) => ["finance", "receipts", "list", filters] as const,
    },
    payments: {
      list: (filters: Record<string, any>) => ["finance", "payments", "list", filters] as const,
    },
  },

  // --- Suppliers ---
  suppliers: {
    all: ["suppliers"] as const,
    list: (filters: Record<string, any>) => ["suppliers", "list", filters] as const,
    detail: (id: string) => ["suppliers", "detail", id] as const,
  },
};
