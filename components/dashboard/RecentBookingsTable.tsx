"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MockAPI } from "@/lib/mock-api";
import { Booking } from "@/types";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { formatCurrencyPKR } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentBookingsTable({ isLoading: initialLoading }: { isLoading: boolean }) {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const bookings = await MockAPI.getBookings();
      setData(bookings);
      setLoading(false);
    }
    loadData();
  }, []);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingRef",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/bookings/${row.original.id}`)}
          className="font-mono text-xs font-medium text-[var(--tf-primary)] hover:underline"
        >
          {row.original.bookingRef}
        </button>
      ),
    },
    {
      accessorKey: "pnr",
      header: "PNR",
      cell: ({ row }) => <div className="font-mono text-xs text-[var(--tf-text-secondary)]">{row.original.pnr}</div>,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">
            {row.original.customer?.firstName} {row.original.customer?.lastName}
          </span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.customer?.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "airline",
      header: "Airline",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">{row.original.airline}</span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.departureCity} → {row.original.arrivalCity}</span>
        </div>
      ),
    },
    {
      accessorKey: "salePrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <div className="font-semibold text-[var(--tf-text-primary)] font-mono tabular-nums text-sm">
          {formatCurrencyPKR(row.original.salePrice)}
        </div>
      ),
    },
    {
      accessorKey: "bookingStatus",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.bookingStatus as any} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/bookings/${row.original.id}`)}
        />
      ),
    },
  ];

  return (
    <div className="bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="tf-h3 text-[var(--tf-text-primary)]">Recent Bookings</h3>
          <p className="text-sm text-[var(--tf-text-secondary)]">Latest flight and package bookings</p>
        </div>
        <Link
          href="/bookings"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--tf-primary)] hover:text-[var(--tf-primary-hover)] transition-colors group"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading || initialLoading}
      />
    </div>
  );
}
