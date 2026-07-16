"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Printer, CreditCard } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RecordPaymentDrawer } from "@/components/bookings/RecordPaymentDrawer";
import { showError } from "@/lib/toast-utils";
import { API } from "@/lib/data-source";
import { Booking } from "@/types";

export default function InvoicesPage() {
  const router = useRouter();
  const [data, setData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const bookings = await API.getBookings();
      setData(bookings);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingRef",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium text-tf-primary">
          {row.original.bookingRef}
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="font-medium text-tf-text-primary">
          {row.original.customer
            ? `${row.original.customer.firstName} ${row.original.customer.lastName}`
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issue Date" />
      ),
      cell: ({ row }) => (
        <span className="text-tf-text-secondary">
          {new Date(row.original.createdAt).toLocaleDateString("en-GB")}
        </span>
      ),
    },
    {
      accessorKey: "salePrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-tf-text-primary">
          ₨ {row.original.salePrice.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      filterFn: (row, id, value) => {
        const rawRowValue = row.getValue(id) as any;
        const rowValue = typeof rawRowValue === 'object' && rawRowValue !== null 
          ? (rawRowValue.id || rawRowValue.value || rawRowValue.name || String(rawRowValue))
          : (rawRowValue || "");
        const filterValue = (value as string) || "";
        return String(rowValue).toLowerCase().replace(/[-_ ]/g, '') === filterValue.toLowerCase().replace(/[-_ ]/g, '');
      },
      cell: ({ row }) => (
        <StatusBadge status={row.original.paymentStatus as any} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const handleViewPDF = async () => {
          try {
            const invoice = await API.generateInvoiceFromBooking(row.original.id);
            window.open(`/print/invoice/${invoice.id}`, "_blank");
          } catch (error: any) {
            showError(error.message || "Failed to view invoice");
          }
        };

        return (
          <DataTableRowActions
            row={row}
            onView={() => router.push(`/bookings/${row.original.id}`)}
            customActions={(row) => (
              <>
                <DropdownMenuItem
                  onClick={handleViewPDF}
                  className="text-tf-text-secondary focus:bg-tf-surface-2 cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Print PDF
                </DropdownMenuItem>
                {row.original.balance > 0 && (
                  <DropdownMenuItem
                    onClick={() => setPaymentBooking(row.original)}
                    className="text-tf-success focus:bg-tf-success/10 focus:text-tf-success cursor-pointer"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record Payment
                  </DropdownMenuItem>
                )}
              </>
            )}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tf-surface p-6 rounded-xl border border-tf-border shadow-sm">
        <div>
          <h1 className="tf-h2 text-tf-text-primary">Invoices</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Manage billing, pending payments, and customer invoices.
          </p>
        </div>
        <Button
          onClick={() => router.push("/bookings/new")}
          className="bg-tf-primary text-white hover:bg-tf-primary-hover shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Generate Invoice
        </Button>
      </div>

      <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
        <DataTable
          columns={columns}
          data={data}
          searchKey="bookingRef"
          searchPlaceholder="Search invoices..."
          isLoading={isLoading}
          filters={[
            {
              column: "paymentStatus",
              title: "Payment",
              options: [
                { label: "Paid", value: "paid" },
                { label: "Partial", value: "partial" },
                { label: "Unpaid", value: "unpaid" },
              ],
            },
          ]}
          emptyState={
            <EmptyState
              icon={FileText}
              title="No invoices generated"
              description="You haven't created any invoices yet. Generate an invoice from a confirmed booking."
              action={{
                label: "Generate Invoice",
                onClick: () => router.push("/bookings/new"),
              }}
            />
          }
        />
      </div>

      <RecordPaymentDrawer
        isOpen={!!paymentBooking}
        onClose={() => setPaymentBooking(null)}
        booking={paymentBooking}
        onSuccess={load}
      />
    </div>
  );
}
