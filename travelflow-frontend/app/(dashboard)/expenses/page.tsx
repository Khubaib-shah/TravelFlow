"use client";

import { useState, useEffect } from "react";
import { Plus, CreditCard } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { showSuccess, showError } from "@/lib/toast-utils";
import { useRouter } from "next/navigation";

import { Expense } from "@/types";
import { API } from "@/lib/data-source";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { DateRange } from "react-day-picker";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormSelect } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  expenseSchema,
  ExpenseFormValues,
} from "@/features/expenses/schemas/expense.schema";
import { useEntityDrawer } from "@/hooks/use-entity-drawer";
import {
  expenseDefaultValues,
  mapExpenseToForm,
} from "@/features/expenses/utils/mapExpenseToForm";

export default function ExpensesPage() {
  const router = useRouter();
  const [data, setData] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { isDrawerOpen, editingId, isEditing, openCreate, openEdit, close } =
    useEntityDrawer();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const expenses = await API.getExpenses(dateRange ? { from: dateRange.from, to: dateRange.to } : undefined);
      setData(expenses);
    } catch (error: unknown) {
      showError(error, { context: "Loading expenses" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expenseDefaultValues,
  });

  const handleOpenCreate = () => {
    form.reset({ ...expenseDefaultValues, date: new Date() });
    openCreate();
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      if (isEditing && editingId) {
        await API.updateExpense(editingId, values);
        showSuccess("Expense updated successfully");
      } else {
        await API.createExpense(values);
        showSuccess("Expense logged successfully");
      }
      close();
      form.reset(expenseDefaultValues);
      await loadData();
    } catch (error: unknown) {
      showError(error, { context: isEditing ? "Updating expense" : "Creating expense" });
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "expenseRef",
      header: "Ref",
      cell: ({ row }) => (
        <div className="font-mono text-xs text-tf-text-muted">
          {row.original.expenseRef}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-tf-text-primary">
            {row.original.title}
          </span>
          <span className="text-xs text-tf-text-secondary capitalize">
            {row.original.category.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-tf-text-secondary">
          {new Date(row.original.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-tf-text-primary">
          ₨ {row.original.amount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => (
        <span className="capitalize text-tf-text-secondary">
          {row.original.paymentMethod.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${row.original.status === "approved" ? "bg-[var(--tf-success-soft)] text-tf-success" : "bg-[var(--tf-warning-soft)] text-[var(--tf-warning)]"}`}
        >
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
            form.reset(mapExpenseToForm(row.original));
            openEdit(row.original.id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tf-surface p-6 rounded-xl border border-tf-border shadow-sm">
        <div>
          <h1 className="tf-h2 text-tf-text-primary">Expenses</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Log and track operational costs.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-tf-primary text-white hover:bg-tf-primary-hover shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </div>

      <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
        <DataTable
          columns={columns}
          data={data}
            searchKey="title"
            searchPlaceholder="Search expenses..."
            isLoading={isLoading}
            extraToolbar={
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            }
            filters={[
              {
                column: "status",
                title: "Status",
                options: [
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ],
              },
            ]}
            emptyState={
              <EmptyState
                icon={CreditCard}
                title="No expenses recorded"
                description={dateRange ? "No expenses found in the selected date range." : "Log your first operational expense to keep your profit calculations accurate."}
                action={{ label: "Log Expense", onClick: handleOpenCreate }}
              />
            }
          />
        </div>

      <DrawerForm
        title={isEditing ? "Edit Expense" : "Log Expense"}
        description={
          isEditing
            ? "Update expense details."
            : "Record a new operational expense."
        }
        isOpen={isDrawerOpen}
        onClose={close}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="md"
        submitLabel={isEditing ? "Save Changes" : "Log Expense"}
      >
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              label="Expense Description"
              placeholder="e.g. Office Rent"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                label="Amount (PKR)"
                type="number"
                required
              />
              <FormSelect
                control={form.control}
                name="category"
                label="Category"
                required
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-tf-text-secondary">
                Date<span className="text-tf-danger ml-0.5">*</span>
              </Label>
              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <Input
                    type="date"
                    className="rounded-lg bg-tf-surface border-tf-border"
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : undefined,
                      )
                    }
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="paidTo" label="Paid To" />
              <FormSelect
                control={form.control}
                name="paymentMethod"
                label="Payment Method"
                required
                options={[
                  { label: "Cash", value: "cash" },
                  { label: "Bank Transfer", value: "bank_transfer" },
                  { label: "Credit Card", value: "credit_card" },
                  { label: "Cheque", value: "cheque" },
                ]}
              />
            </div>
            <FormField control={form.control} name="notes" label="Notes" />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
