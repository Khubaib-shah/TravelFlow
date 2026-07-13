"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { API } from "@/lib/data-source";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useEntityDrawer } from "@/hooks/use-entity-drawer";
import { QuotationDrawer } from "@/components/quotations/QuotationDrawer";
import type { QuotationFormValues } from "@/features/quotations/schemas/quotation.schema";
import { mapQuotationToForm } from "@/features/quotations/utils/mapQuotationToForm";

import type { Quotation, Customer, Supplier, Branch, User } from "@/types";

export default function QuotationsPage() {
  const router = useRouter();
  const [data, setData] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isDrawerOpen, editingId, isEditing, openCreate, openEdit, close } =
    useEntityDrawer();

  const [viewingQuotationId, setViewingQuotationId] = useState<string | null>(
    null,
  );
  const [viewInitialValues, setViewInitialValues] = useState<
    Partial<QuotationFormValues>
  >({});
  const [isViewMode, setIsViewMode] = useState(false);

  const openView = async (id: string) => {
    setIsViewMode(true);
    setViewingQuotationId(id);
    try {
      const q = await API.getQuotation(id);
      setViewInitialValues(mapQuotationToForm(q));
    } catch (e: any) {
      toast.error(e.message || "Failed to load quotation");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [quotations, customerList, supplierList, agentList] =
        await Promise.all([
          API.getQuotations(),
          API.getCustomers(),
          API.getSuppliers(),
          API.getAgents(),
        ]);
      setData(quotations);
      setCustomers(customerList);
      setSuppliers(supplierList);
      setAgents(agentList);

      try {
        const b = await API.getBranches();
        console.log(b);
        setBranches(b);
      } catch {
        setBranches([]);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load quotations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const initialValues = {
    customerId: customers[0]?.id ?? "",
    branchId: branches[0]?.id,
    agentId: agents[0]?.id,
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "quotationRef",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium text-tf-primary">
          {row.original.quotationRef}
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-tf-text-primary">
            {row.original.customer?.firstName ?? "-"}{" "}
            {row.original.customer?.lastName ?? ""}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-tf-success">
          ₨ {row.original.grandTotal?.toLocaleString?.() ?? "0"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status as any} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => openView(row.original.id)}
          onEdit={() => {
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
          <h1 className="tf-h2 text-tf-text-primary">Quotations</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Create and manage customer quotations.
          </p>
        </div>
        <Button
          onClick={() => openCreate()}
          className="bg-tf-primary text-white hover:bg-tf-primary-hover shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      {!isLoading && data.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No quotations found"
          description="Create your first quotation to get started."
          action={{ label: "Create Quotation", onClick: () => openCreate() }}
        />
      ) : (
        <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="quotationRef"
            searchPlaceholder="Search by reference..."
            isLoading={isLoading}
          />
        </div>
      )}

      <QuotationDrawer
        title={
          isViewMode
            ? "Quotation"
            : isEditing
              ? "Edit Quotation"
              : "Add New Quotation"
        }
        description={
          isViewMode
            ? "View quotation details."
            : isEditing
              ? "Update quotation items, taxes and totals."
              : "Create a new quotation for a customer."
        }
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsViewMode(false);
          setViewingQuotationId(null);
          close();
        }}
        editingId={isViewMode ? undefined : (editingId ?? undefined)}
        mode={isViewMode ? "view" : isEditing ? "edit" : "create"}
        customers={customers}
        branches={branches}
        agents={agents}
        initialValues={isViewMode ? viewInitialValues : initialValues}
        onSaved={async () => {
          await loadData();
        }}
        onEditFromView={() => {
          if (!viewingQuotationId) return;
          setIsViewMode(false);
          openEdit(viewingQuotationId);
        }}
        onCreateFromView={() => {
          setIsViewMode(false);
          openCreate();
        }}
      />
    </div>
  );
}
