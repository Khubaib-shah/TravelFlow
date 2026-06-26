"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";

import { Customer } from "@/types";
import { MockAPI } from "@/lib/mock-api";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { customerSchema, CustomerFormValues } from "@/features/customers/schemas/customer.schema";
import { useCreateDrawer } from "@/hooks/use-create-drawer";

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDrawerOpen, openDrawer, closeDrawer } = useCreateDrawer();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const customers = await MockAPI.getCustomers();
      setData(customers);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: "individual",
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      whatsapp: "",
      city: "",
    },
  });

  const onSubmit = async (values: CustomerFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("New Customer:", values);
    toast.success("Customer added successfully");
    closeDrawer();
    form.reset();
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "customerRef",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
      cell: ({ row }) => <div className="font-mono text-xs font-medium text-[var(--tf-primary)]">{row.original.customerRef}</div>,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-xs text-[var(--tf-text-muted)]">
            {row.original.type === 'corporate' ? row.original.companyName : 'Individual'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-[var(--tf-text-secondary)]">{row.original.phone}</span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => <span className="text-[var(--tf-text-secondary)]">{row.original.city || '-'}</span>,
    },
    {
      accessorKey: "totalBookings",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bookings" />,
      cell: ({ row }) => <span className="font-medium text-[var(--tf-text-primary)]">{row.original.totalBookings}</span>,
    },
    {
      accessorKey: "totalSpent",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Spent" />,
      cell: ({ row }) => <div className="text-[var(--tf-text-primary)]">₨ {row.original.totalSpent.toLocaleString()}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/customers/${row.original.id}`)}
          onEdit={() => {
            openDrawer();
            toast.success(`Editing customer ${row.original.firstName}`);
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Customers</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage your customer database and booking history.</p>
        </div>
        <Button
          onClick={openDrawer}
          className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Your customer database is empty. Add a customer to start managing their profiles and bookings."
          action={{ label: "Add Customer", onClick: openDrawer }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="firstName"
            searchPlaceholder="Search customers by name..."
            isLoading={isLoading}
          />
        </div>
      )}

      <DrawerForm
        title="Add Customer"
        description="Add a new individual or corporate customer to your database."
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="md"
      >
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" label="First Name" />
              <FormField control={form.control} name="lastName" label="Last Name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" label="Phone Number" type="tel" />
              <FormField control={form.control} name="email" label="Email Address" type="email" />
            </div>

            <FormField control={form.control} name="city" label="City" />

            <FormField control={form.control} name="companyName" label="Company Name (Optional)" description="Only required for corporate clients." />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
