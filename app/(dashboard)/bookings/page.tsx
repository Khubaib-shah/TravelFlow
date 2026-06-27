"use client";

import { useState, useEffect } from "react";
import { Plus, Plane } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Booking, Customer, Supplier } from "@/types";
import { MockAPI } from "@/lib/mock-api";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormSelect, FormTextArea } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingSchema, BookingFormValues } from "@/features/bookings/schemas/booking.schema";
import { useEntityDrawer } from "@/hooks/use-entity-drawer";
import { bookingDefaultValues, mapBookingToForm } from "@/features/bookings/utils/mapBookingToForm";

export default function BookingsPage() {
  const router = useRouter();
  const [data, setData] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDrawerOpen, editingId, isEditing, openCreate, openEdit, close } = useEntityDrawer();

  const loadData = async () => {
    setIsLoading(true);
    const [bookings, customerList, supplierList] = await Promise.all([
      MockAPI.getBookings(),
      MockAPI.getCustomers(),
      MockAPI.getSuppliers(),
    ]);
    setData(bookings);
    setCustomers(customerList);
    setSuppliers(supplierList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: bookingDefaultValues,
  });

  const handleOpenCreate = () => {
    form.reset({
      ...bookingDefaultValues,
      customerId: customers[0]?.id ?? "",
      supplierId: suppliers[0]?.id ?? "",
      departureDate: new Date(),
    });
    openCreate();
  };

  const onSubmit = async (values: BookingFormValues) => {
    if (isEditing && editingId) {
      await MockAPI.updateBooking(editingId, values);
      toast.success("Booking updated successfully");
    } else {
      const booking = await MockAPI.createBookingFromForm(values);
      toast.success("Booking created successfully", { description: `Reference: ${booking.bookingRef}` });
    }
    close();
    form.reset(bookingDefaultValues);
    await loadData();
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingRef",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
      cell: ({ row }) => <div className="font-mono text-xs font-medium text-[var(--tf-primary)]">{row.original.bookingRef}</div>,
    },
    {
      accessorKey: "pnr",
      header: "PNR / Ticket",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[var(--tf-text-secondary)]">{row.original.pnr}</span>
          {row.original.ticketNumber && <span className="font-mono text-[10px] text-[var(--tf-text-muted)]">{row.original.ticketNumber}</span>}
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">{row.original.customer?.firstName} {row.original.customer?.lastName}</span>
        </div>
      ),
    },
    {
      accessorKey: "airline",
      header: "Route & Airline",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">{row.original.airline}</span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.departureCity} &rarr; {row.original.arrivalCity}</span>
        </div>
      ),
    },
    {
      accessorKey: "costPrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Profit Margin" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--tf-success)]">₨ {row.original.profit.toLocaleString()}</span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.profitMargin.toFixed(1)}% margin</span>
        </div>
      ),
    },
    {
      accessorKey: "bookingStatus",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.bookingStatus as any} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus as any} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/bookings/${row.original.id}`)}
          onEdit={() => {
            form.reset(mapBookingToForm(row.original));
            openEdit(row.original.id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Bookings</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage flight and package bookings, tracking revenue and margins.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Create Booking
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState
          icon={Plane}
          title="No bookings found"
          description="Create your first booking to start tracking revenue and profit."
          action={{ label: "Create Booking", onClick: handleOpenCreate }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="pnr"
            searchPlaceholder="Search by PNR..."
            isLoading={isLoading}
            filters={[
              {
                column: "bookingStatus",
                title: "Status",
                options: [
                  { label: "Confirmed", value: "confirmed" },
                  { label: "Pending", value: "pending" },
                  { label: "Cancelled", value: "cancelled" },
                  { label: "Completed", value: "completed" },
                ],
              },
            ]}
            enableExport
          />
        </div>
      )}

      <DrawerForm
        title={isEditing ? "Edit Booking" : "Create Booking"}
        description={isEditing ? "Update booking details and pricing." : "Enter new booking details for a flight or package."}
        isOpen={isDrawerOpen}
        onClose={close}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="lg"
        submitLabel={isEditing ? "Save Changes" : "Create Booking"}
      >
        <Form {...form}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect control={form.control} name="customerId" label="Customer" required options={customers.map((c) => ({
                label: `${c.firstName} ${c.lastName}`,
                value: c.id,
              }))} />
              <FormSelect control={form.control} name="supplierId" label="Supplier" required options={suppliers.map((s) => ({
                label: s.name,
                value: s.id,
              }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="airline" label="Airline" placeholder="e.g. Emirates" required />
              <FormField control={form.control} name="pnr" label="PNR" placeholder="6-char alphanumeric" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="departureCity" label="From (City/Airport)" placeholder="e.g. KHI" required />
              <FormField control={form.control} name="arrivalCity" label="To (City/Airport)" placeholder="e.g. DXB" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[var(--tf-text-secondary)]">
                  Departure Date<span className="text-[var(--tf-danger)] ml-0.5">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <Input
                      type="date"
                      className="rounded-lg bg-[var(--tf-surface)] border-[var(--tf-border)]"
                      value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  )}
                />
              </div>
              <FormField control={form.control} name="ticketNumber" label="Ticket Number" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="costPrice" label="Cost Price (PKR)" type="number" required />
              <FormField control={form.control} name="salePrice" label="Sale Price (PKR)" type="number" required />
            </div>
            <FormSelect control={form.control} name="paymentStatus" label="Payment Status" required options={[
              { label: "Unpaid", value: "unpaid" },
              { label: "Partial", value: "partial" },
              { label: "Paid", value: "paid" },
            ]} />
            <FormTextArea control={form.control} name="notes" label="Additional Notes" />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
