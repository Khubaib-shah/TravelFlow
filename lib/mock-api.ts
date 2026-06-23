// lib/mock-api.ts
import { mockLeads } from "@/mock-data/leads";
import { mockCustomers } from "@/mock-data/customers";
import { mockBookings } from "@/mock-data/bookings";
import { mockDashboardData } from "@/mock-data/dashboard";
import { mockSuppliers } from "@/mock-data/suppliers";
import { mockExpenses } from "@/mock-data/expenses";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockAPI = {
  getDashboardStats: async () => {
    await delay(400);
    return mockDashboardData;
  },
  getLeads: async () => {
    await delay(400);
    return mockLeads;
  },
  getLead: async (id: string) => {
    await delay(400);
    return mockLeads.find(l => l.id === id || l.leadRef === id) || mockLeads[0];
  },
  getCustomers: async () => {
    await delay(400);
    return mockCustomers;
  },
  getCustomer: async (id: string) => {
    await delay(400);
    return mockCustomers.find(c => c.id === id) || mockCustomers[0];
  },
  getBookings: async () => {
    await delay(400);
    return mockBookings;
  },
  getBooking: async (id: string) => {
    await delay(400);
    return mockBookings.find(b => b.id === id || b.pnr === id || b.bookingRef === id) || mockBookings[0];
  },
  getSuppliers: async () => {
    await delay(400);
    return mockSuppliers;
  },
  getSupplier: async (id: string) => {
    await delay(400);
    return mockSuppliers.find(s => s.id === id) || mockSuppliers[0];
  },
  getExpenses: async () => {
    await delay(400);
    return mockExpenses;
  },
  getExpense: async (id: string) => {
    await delay(400);
    return mockExpenses.find(e => e.id === id || e.expenseRef === id) || mockExpenses[0];
  }
};
