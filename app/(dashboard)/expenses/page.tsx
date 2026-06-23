"use client";

import { useState, useEffect } from "react";
import { Plus, CreditCard } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Expense } from "@/types";
import { MockAPI } from "@/lib/mock-api";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormSelect } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { expenseSchema, ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";

export default function ExpensesPage() {
  const router = useRouter();
  const [data, setData] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const expenses = await MockAPI.getExpenses();
      setData(expenses);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      category: "office_supplies",
      amount: undefined,
      paymentMethod: "bank_transfer",
      paidTo: "",
      notes: "",
    },
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("New Expense:", values);
    toast.success("Expense logged successfully");
    setIsDrawerOpen(false);
    form.reset();
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "expenseRef",
      header: "Ref",
      cell: ({ row }) => <div className="font-mono text-xs text-[var(--tf-text-muted)]">{row.original.expenseRef}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">{row.original.title}</span>
          <span className="text-xs text-[var(--tf-text-secondary)] capitalize">{row.original.category.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <span className="text-[var(--tf-text-secondary)]">{format(new Date(row.original.date), 'dd MMM yyyy')}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <div className="font-semibold text-[var(--tf-text-primary)]">₨ {row.original.amount.toLocaleString()}</div>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => <span className="capitalize text-[var(--tf-text-secondary)]">{row.original.paymentMethod.replace('_', ' ')}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${row.original.status === 'approved' ? 'bg-[var(--tf-success-soft)] text-[var(--tf-success)]' : 'bg-[var(--tf-warning-soft)] text-[var(--tf-warning)]'}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          onView={() => router.push(`/expenses/${row.original.id}`)} 
          onEdit={() => {
            setIsDrawerOpen(true);
            toast.success(`Editing expense`);
          }} 
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Expenses</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Log and track operational costs.</p>
        </div>
        <Button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState 
          icon={CreditCard} 
          title="No expenses recorded" 
          description="Log your first operational expense to keep your profit calculations accurate."
          action={{ label: "Log Expense", onClick: () => setIsDrawerOpen(true) }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm p-6">
          <DataTable 
            columns={columns} 
            data={data} 
            searchKey="title" 
            searchPlaceholder="Search expenses..."
            isLoading={isLoading} 
            filters={[
              {
                column: "status",
                title: "Status",
                options: [
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ]
              }
            ]}
          />
        </div>
      )}

      <DrawerForm
        title="Log Expense"
        description="Record a new operational expense."
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="md"
      >
        <Form {...form}>
          <div className="space-y-6">
            <FormField control={form.control} name="title" label="Expense Description" placeholder="e.g. Office Rent" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" label="Amount (PKR)" type="number" />
              <FormSelect 
                control={form.control} 
                name="category" 
                label="Category" 
                options={[
                  { label: "Salary", value: "salary" },
                  { label: "Rent", value: "rent" },
                  { label: "Marketing", value: "marketing" },
                  { label: "Utilities", value: "utilities" },
                  { label: "Office Supplies", value: "office_supplies" },
                  { label: "Software", value: "software" },
                  { label: "Travel", value: "travel" },
                  { label: "Other", value: "other" },
                ]} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="paidTo" label="Paid To" />
              <FormSelect 
                control={form.control} 
                name="paymentMethod" 
                label="Payment Method" 
                options={[
                  { label: "Cash", value: "cash" },
                  { label: "Bank Transfer", value: "bank_transfer" },
                  { label: "Credit Card", value: "credit_card" },
                  { label: "Check", value: "check" },
                ]} 
              />
            </div>
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
