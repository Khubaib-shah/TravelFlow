import { Expense } from "@/types";

export const mockExpenses: Expense[] = [
  {
    id: "exp-1",
    agencyId: "ag-1",
    branchId: "br-1",
    expenseRef: "EXP-2024-001",
    title: "Office Rent - May 2024",
    category: "rent",
    amount: 150000,
    date: new Date("2024-05-01"),
    paidTo: "Plaza Management Ltd",
    paymentMethod: "bank_transfer",
    recordedById: "user-1",
    status: "approved",
    createdAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-05-01"),
  },
  {
    id: "exp-2",
    agencyId: "ag-1",
    branchId: "br-1",
    expenseRef: "EXP-2024-002",
    title: "Facebook Ads - April",
    category: "marketing",
    amount: 45000,
    date: new Date("2024-04-30"),
    paymentMethod: "credit_card",
    recordedById: "user-1",
    status: "approved",
    createdAt: new Date("2024-04-30"),
    updatedAt: new Date("2024-04-30"),
  }
];
