"use client";

import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function ReceiptsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([
    { receiptRef: "RCP-2024-001", customer: "Usman Ali", date: "16 May 2024", amount: 45000, paymentMethod: "Bank Transfer" },
    { receiptRef: "RCP-2024-002", customer: "Ali Hassan", date: "19 May 2024", amount: 60000, paymentMethod: "Cash" },
  ]); 
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "receiptRef",
      header: "Receipt #",
      cell: ({ row }) => <div className="font-mono text-xs font-medium text-[var(--tf-primary)]">{row.original.receiptRef}</div>,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium text-[var(--tf-text-primary)]">{row.original.customer}</span>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => <span className="text-[var(--tf-text-secondary)]">{row.original.date}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount Received" />,
      cell: ({ row }) => <div className="font-semibold text-[var(--tf-success)]">₨ {row.original.amount.toLocaleString()}</div>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => <span className="capitalize text-[var(--tf-text-secondary)]">{row.original.paymentMethod}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          onView={() => router.push(`/receipts/${row.original.receiptRef}`)} 
          onEdit={() => toast.success(`Editing receipt ${row.original.receiptRef}`)} 
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Receipts</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Track incoming payments and issued receipts.</p>
        </div>
        <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState 
          icon={Receipt} 
          title="No receipts recorded" 
          description="You haven't recorded any payments yet. Add a payment to a booking to generate a receipt."
          action={{ label: "Add Payment" }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm p-6">
          <DataTable columns={columns} data={data} searchKey="receiptRef" isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
