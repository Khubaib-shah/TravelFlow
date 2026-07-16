"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Share2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/lib/toast-utils";

import { useQueryClient } from "@tanstack/react-query";
import { useQuotations, useCreateQuotation, useUpdateQuotation } from "@/features/quotations/hooks/queries";
import { useCustomers } from "@/features/customers/hooks/queries";
import { useSuppliers } from "@/features/suppliers/hooks/queries";
import { useAgents, useBranches } from "@/features/shared/hooks/queries";
import { queryKeys } from "@/lib/query-keys";
import { API } from "@/lib/data-source";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { DateRange } from "react-day-picker";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEntityDrawer } from "@/hooks/use-entity-drawer";
import { QuotationDrawer } from "@/components/quotations/QuotationDrawer";
import { QuotationPreviewModal } from "@/components/quotations/QuotationPreviewModal";
import type { QuotationFormValues } from "@/features/quotations/schemas/quotation.schema";
import { mapQuotationToForm } from "@/features/quotations/utils/mapQuotationToForm";

import type { Quotation, Customer, Supplier, Branch, User } from "@/types";

export default function QuotationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data = [], isLoading: isQuotationsLoading } = useQuotations(dateRange ? { from: dateRange.from, to: dateRange.to } : undefined);
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomers();
  const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliers();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents();

  const isLoading = isQuotationsLoading || isCustomersLoading || isSuppliersLoading || isBranchesLoading || isAgentsLoading;

  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();

  const { isDrawerOpen, editingId, isEditing, openCreate, openEdit, close } =
    useEntityDrawer();

  const [viewingQuotationId, setViewingQuotationId] = useState<string | null>(
    null,
  );
  const [viewInitialValues, setViewInitialValues] = useState<
    Partial<QuotationFormValues>
  >({});
  const [isViewMode, setIsViewMode] = useState(false);

  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  const onSubmit = async (values: QuotationFormValues) => {
    try {
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: values });
        showSuccess("Quotation updated successfully");
      } else {
        const quotation = await createMutation.mutateAsync(values);
        showSuccess("Quotation created successfully", {
          description: `Reference: ${quotation.quotationRef}`,
        });
      }
      close();
    } catch (error: unknown) {
      showError(error, { context: isEditing ? "Updating quotation" : "Creating quotation" });
    }
  };



  const openView = async (id: string) => {
    try {
      const q = await queryClient.fetchQuery({
        queryKey: queryKeys.quotations.detail(id),
        queryFn: () => API.getQuotation(id),
      });
      setViewInitialValues(mapQuotationToForm(q));
      setViewingQuotationId(id);
      setIsViewMode(true);
    } catch (e: any) {
      showError(e.message || "Failed to load quotation");
    }
  };

  const handleOpenEdit = async (id: string) => {
    try {
      const q = await queryClient.fetchQuery({
        queryKey: queryKeys.quotations.detail(id),
        queryFn: () => API.getQuotation(id),
      });
      setViewInitialValues(mapQuotationToForm(q));
      openEdit(id);
    } catch (e: any) {
      showError(e.message || "Failed to load quotation");
    }
  };

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
            handleOpenEdit(row.original.id);
          }}
          customActions={(row) => (
            <>
              <DropdownMenuItem
                onClick={() => {
                  window.open(`/print/quotation/${row.original.id}`, "_blank");
                }}
                className="text-tf-text-secondary focus:bg-tf-surface-2 cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                View PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  showSuccess("Sharing option will be available soon!");
                }}
                className="text-tf-text-secondary focus:bg-tf-surface-2 cursor-pointer"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </>
          )}
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

      <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
        <DataTable
          columns={columns}
          data={data}
            searchKey="quotationRef"
            searchPlaceholder="Search by reference..."
            isLoading={isLoading}
            extraToolbar={
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            }
            emptyState={
              <EmptyState
                icon={Plus}
                title="No quotations found"
                description={dateRange ? "No quotations found in the selected date range." : "Create your first quotation to get started."}
                action={{ label: "Create Quotation", onClick: () => openCreate() }}
              />
            }
          />
        </div>

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
        isOpen={isDrawerOpen || isViewMode}
        onClose={() => {
          setIsViewMode(false);
          close();
        }}
        mode={isViewMode ? "view" : isEditing ? "edit" : "create"}
        editingId={isViewMode ? viewingQuotationId! : editingId ?? undefined}
        customers={customers}
        branches={branches}
        agents={agents}
        initialValues={isViewMode || isEditing ? viewInitialValues : initialValues}
        onSaved={async (q) => {
          if (!isEditing && !isViewMode) {
            setPreviewQuotation(q);
          }
        }}
        onEditFromView={() => {
          setIsViewMode(false);
          openEdit(viewingQuotationId!);
        }}
        onCreateFromView={() => {
          setIsViewMode(false);
          openCreate();
        }}
      />
      <QuotationPreviewModal
        isOpen={!!previewQuotation}
        onClose={() => setPreviewQuotation(null)}
        quotation={previewQuotation}
      />
    </div>
  );
}
