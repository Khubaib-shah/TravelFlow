"use client";

import { useState, useEffect } from "react";
import { Plus, Plane } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Booking } from "@/types";
import { MockAPI } from "@/lib/mock-api";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormTextArea } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { bookingSchema, BookingFormValues } from "@/features/bookings/schemas/booking.schema";

export default function BookingsPage() {
  const router = useRouter();
  const [data, setData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const bookings = await MockAPI.getBookings();
      setData(bookings);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerId: "cust-1", // mock default
      supplierId: "sup-1",  // mock default
      airline: "",
      departureCity: "",
      arrivalCity: "",
      pnr: "",
      ticketNumber: "",
      costPrice: undefined,
      salePrice: undefined,
      paymentStatus: "unpaid",
      amountReceived: 0,
      notes: "",
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("New Booking:", values);
    toast.success("Booking created successfully");
    setIsDrawerOpen(false);
    form.reset();
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
            setIsDrawerOpen(true);
            toast.success(`Editing booking ${row.original.pnr}`);
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
        <Button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Booking
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState 
          icon={Plane} 
          title="No bookings found" 
          description="Create your first booking to start tracking revenue and profit."
          action={{ label: "Create Booking", onClick: () => setIsDrawerOpen(true) }}
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
                ]
              }
            ]}
            enableExport
          />
        </div>
      )}

      <DrawerForm
        title="Create Booking"
        description="Enter new booking details for a flight or package."
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="lg"
      >
        <Form {...form}>
          <div className="space-y-8">
            {/* Note: In a real app, customer and supplier would use a searchable combobox */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="airline" label="Airline" placeholder="e.g. Emirates" />
              <FormField control={form.control} name="pnr" label="PNR" placeholder="6-char alphanumeric" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="departureCity" label="From (City/Airport)" placeholder="e.g. KHI" />
              <FormField control={form.control} name="arrivalCity" label="To (City/Airport)" placeholder="e.g. DXB" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="costPrice" label="Cost Price (PKR)" type="number" />
              <FormField control={form.control} name="salePrice" label="Sale Price (PKR)" type="number" />
            </div>

            <FormTextArea control={form.control} name="notes" label="Additional Notes" />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
