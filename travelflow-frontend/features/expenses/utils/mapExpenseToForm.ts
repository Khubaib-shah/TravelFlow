import type { Expense } from "@/types";
import type { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";

export function mapExpenseToForm(expense: Expense): ExpenseFormValues {
  return {
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    date: new Date(expense.date),
    paidTo: expense.paidTo ?? "",
    paymentMethod: expense.paymentMethod,
    notes: expense.notes ?? "",
  };
}

export const expenseDefaultValues: ExpenseFormValues = {
  title: "",
  category: "other",
  amount: undefined as unknown as number,
  date: new Date(),
  paidTo: "",
  paymentMethod: "cash",
  notes: "",
};
