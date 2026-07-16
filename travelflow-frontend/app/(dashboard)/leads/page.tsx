"use client";

import { useState, useEffect } from "react";
import { Plus, UserPlus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Lead, Branch, User } from "@/types";
import { API } from "@/lib/data-source";
import { useAuthStore } from "@/store/auth.store";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import {
  FormField,
  FormTextArea,
  FormSelect,
} from "@/components/forms/FormField";
import { LeadSourceSelector } from "@/components/forms/LeadSourceSelector";
import { Form } from "@/components/ui/form";
import {
  leadSchema,
  LeadFormValues,
} from "@/features/leads/schemas/lead.schema";
import { leadStatusOptions } from "@/features/leads/constants";
import { useEntityDrawer } from "@/hooks/use-entity-drawer";
import {
  leadDefaultValues,
  mapLeadToForm,
} from "@/features/leads/utils/mapLeadToForm";
import { usePermissions } from "@/hooks/use-permissions";

export default function LeadsPage() {
  const router = useRouter();
  const [data, setData] = useState<Lead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDrawerOpen, editingId, isEditing, openCreate, openEdit, close } =
    useEntityDrawer();
  const { hasPermission } = usePermissions();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leads, agentList] = await Promise.all([
        API.getLeads(),
        API.getAgents(),
      ]);
      setData(leads);
      setAgents(agentList);
      // Branches are admin/manager only — silently skip for agents
      try {
        const branchList = await API.getBranches();
        setBranches(branchList);
      } catch {
        setBranches([]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load leads data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: leadDefaultValues,
  });

  const handleOpenCreate = () => {
    form.reset(leadDefaultValues);
    openCreate();
  };

  const onSubmit = async (values: LeadFormValues) => {
    try {
      if (isEditing && editingId) {
        await API.updateLead(editingId, values);
        toast.success("Lead updated successfully");
      } else {
        const lead = await API.createLead(values);
        toast.success("Lead created successfully", {
          description: `Reference: ${lead.leadRef}`,
        });
      }
      close();
      form.reset(leadDefaultValues);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save lead");
    }
  };

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "leadRef",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reference" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs font-medium text-tf-primary">
          {row.original.leadRef}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-tf-text-primary">
            {row.original.name}
          </span>
          <span className="text-xs text-tf-text-muted">
            {row.original.phone}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <span className="capitalize text-sm">
          {row.original.source.replace("_", " ")}
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
          onView={() => router.push(`/leads/${row.original.id}`)}
          onEdit={hasPermission("Leads: Edit") ? () => {
            form.reset(mapLeadToForm(row.original));
            openEdit(row.original.id);
          } : undefined}
          onDelete={hasPermission("Leads: Delete") ? async (r) => {
            if (!confirm(`Delete lead "${r.original.name}"?`)) return;
            try {
              await API.deleteLead(r.original.id);
              toast.success("Lead deleted");
              await loadData();
            } catch (e: any) {
              toast.error(e.message || "Failed to delete lead");
            }
          } : undefined}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tf-surface p-6 rounded-xl border border-tf-border shadow-sm">
        <div>
          <h1 className="tf-h2 text-tf-text-primary">Leads</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Manage and track your prospective customers.
          </p>
        </div>
        <div className="flex gap-4">
          {hasPermission("Quotations: Create") && (
            <Button
              onClick={handleOpenCreate}
              className="bg-tf-primary text-white hover:bg-tf-primary-hover shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Quotation
            </Button>
          )}
          {hasPermission("Leads: Create") && (
            <Button
              onClick={handleOpenCreate}
              className="bg-tf-primary text-white hover:bg-tf-primary-hover shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Lead
            </Button>
          )}
        </div>
      </div>

      {!isLoading && data.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No leads found"
          description="You haven't added any leads yet. Create your first lead to start tracking your sales pipeline."
          action={{ label: "Add New Lead", onClick: handleOpenCreate }}
        />
      ) : (
        <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder="Search leads by name..."
            isLoading={isLoading}
            filters={[
              {
                column: "status",
                title: "Status",
                options: leadStatusOptions.map(({ label, value }) => ({
                  label,
                  value,
                })),
              },
            ]}
          />
        </div>
      )}

      <DrawerForm
        title={isEditing ? "Edit Lead" : "Add New Lead"}
        description={
          isEditing
            ? "Update lead details and pipeline status."
            : "Create a new lead inquiry to start tracking them in your pipeline."
        }
        isOpen={isDrawerOpen}
        onClose={close}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="md"
        submitLabel={isEditing ? "Save Changes" : "Create Lead"}
      >
        <Form {...form}>
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="e.g. Ahmed Raza"
                  required
                />
                <FormField
                  control={form.control}
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  required
                />
                <FormField
                  control={form.control}
                  name="whatsapp"
                  label="WhatsApp"
                  type="tel"
                />
                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Trip Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destination"
                  label="Destination"
                  placeholder="e.g. Dubai, Umrah"
                  required
                />
                <FormField
                  control={form.control}
                  name="travelDate"
                  label="Travel Date"
                  type="date"
                />
                <FormField
                  control={form.control}
                  name="budget"
                  label="Budget (PKR)"
                  type="number"
                  placeholder="0 = Unspecified"
                />
                <FormField
                  control={form.control}
                  name="adults"
                  label="Adults"
                  type="number"
                  required
                />
                <FormField
                  control={form.control}
                  name="children"
                  label="Children"
                  type="number"
                />
              </div>
              <FormTextArea
                control={form.control}
                name="specialRequirements"
                label="Special Requirements"
                placeholder="Max 500 chars"
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Classification
              </h4>
              <Controller
                control={form.control}
                name="source"
                render={({ field }) => (
                  <LeadSourceSelector
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Lead Status"
                  required
                  options={leadStatusOptions.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="assignedAgentId"
                  label="Assigned Agent"
                  options={agents.map((a) => ({
                    label: `${a.firstName} ${a.lastName}`,
                    value: a.id,
                  }))}
                />
                <FormSelect
                  control={form.control}
                  name="branchId"
                  label="Branch"
                  options={branches.map((b) => ({
                    label: b.name,
                    value: b.id,
                  }))}
                />
              </div>
            </div>
            <FormTextArea
              control={form.control}
              name="notes"
              label="Initial Notes"
              placeholder="Optional notes..."
            />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
