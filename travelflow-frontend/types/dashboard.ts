export interface DashboardStats {
  totalLeads: number;
  totalCustomers: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  totalExpenses: number;
  activeBookings: number;
  
  trends: {
    leads: number;
    customers: number;
    revenue: number;
    profit: number;
    expenses: number;
    bookings: number;
  };
  
  sparklines: {
    leads: number[];
    customers: number[];
    revenue: number[];
    profit: number[];
    expenses: number[];
    bookings: number[];
  };
}
