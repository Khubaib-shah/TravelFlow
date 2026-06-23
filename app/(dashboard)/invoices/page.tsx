"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function InvoicesPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([
    { invoiceRef: "INV-2024-001", customer: "Usman Ali", issueDate: "15 May 2024", totalAmount: 45000, status: "paid" },
    { invoiceRef: "INV-2024-002", customer: "Ali Hassan", issueDate: "18 May 2024", totalAmount: 120000, status: "pending" },
    { invoiceRef: "INV-2024-003", customer: "Ayesha Khan", issueDate: "20 May 2024", totalAmount: 75000, status: "overdue" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoiceRef",
      header: "Invoice #",
      cell: ({ row }) => <div className="font-mono text-xs font-medium text-[var(--tf-primary)]">{row.original.invoiceRef}</div>,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium text-[var(--tf-text-primary)]">{row.original.customer}</span>,
    },
    {
      accessorKey: "issueDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issue Date" />,
      cell: ({ row }) => <span className="text-[var(--tf-text-secondary)]">{row.original.issueDate}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <div className="font-semibold text-[var(--tf-text-primary)]">₨ {row.original.totalAmount.toLocaleString()}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          onView={() => router.push(`/invoices/${row.original.invoiceRef}`)} 
          onEdit={() => toast.success(`Editing invoice ${row.original.invoiceRef}`)} 
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Invoices</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage billing, pending payments, and customer invoices.</p>
        </div>
        <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Generate Invoice
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState 
          icon={FileText} 
          title="No invoices generated" 
          description="You haven't created any invoices yet. Generate an invoice from a confirmed booking."
          action={{ label: "Generate Invoice" }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm p-6">
          <DataTable columns={columns} data={data} searchKey="invoiceRef" isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
