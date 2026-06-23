import { DashboardStats } from "@/types";

export const mockDashboardData: DashboardStats = {
  totalLeads: 348,
  totalCustomers: 1204,
  monthlyRevenue: 4820000,
  monthlyProfit: 680000,
  totalExpenses: 320000,
  activeBookings: 127,
  trends: {
    leads: 12.5,
    customers: 8.2,
    revenue: 15.4,
    profit: 10.1,
    expenses: -2.4,
    bookings: 5.0,
  },
  sparklines: {
    leads: [10, 25, 15, 30, 28, 40, 35],
    customers: [20, 22, 25, 24, 30, 32, 35],
    revenue: [30, 25, 40, 35, 50, 45, 60],
    profit: [15, 18, 16, 20, 25, 22, 28],
    expenses: [40, 35, 38, 30, 32, 28, 25],
    bookings: [12, 15, 14, 18, 16, 20, 22],
  }
};
