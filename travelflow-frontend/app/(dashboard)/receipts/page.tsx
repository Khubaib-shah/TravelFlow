"use client";

import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { API } from "@/lib/data-source";

export default function ReceiptsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const receipts = await API.getReceipts();
        setData(receipts);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "receiptRef",
      header: "Receipt #",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium text-tf-primary">
          {row.original.receiptRef}
        </div>
      ),
    },
    {
      accessorKey: "customerId",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customerId;
        const customerName = typeof customer === 'object' && customer !== null
          ? customer.name
          : customer;

        return (
          <span className="font-medium text-tf-text-primary">
            {customerName || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <span className="text-tf-text-secondary">
          {new Date(
            row.original.date ?? row.original.createdAt,
          ).toLocaleDateString("en-GB")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount Received" />
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-tf-success">
          ₨ {Number(row.original.amount).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => (
        <span className="capitalize text-tf-text-secondary">
          {row.original.paymentMethod?.replace("_", " ") || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/bookings/${row.original.bookingId}`)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tf-surface p-6 rounded-xl border border-tf-border shadow-sm">
        <div>
          <h1 className="tf-h2 text-tf-text-primary">Receipts</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Track incoming payments and issued receipts.
          </p>
        </div>
      </div>

      {!isLoading && data.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts recorded"
          description="You haven't recorded any payments yet. Add a payment to a booking to generate a receipt."
        />
      ) : (
        <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="receiptRef"
            searchPlaceholder="Search receipts..."
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
