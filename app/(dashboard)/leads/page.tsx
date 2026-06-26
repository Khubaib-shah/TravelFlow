"use client";

import { useState, useEffect } from "react";
import { Plus, UserPlus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Lead } from "@/types";
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
import { leadSchema, LeadFormValues } from "@/features/leads/schemas/lead.schema";
import { useCreateDrawer } from "@/hooks/use-create-drawer";

export default function LeadsPage() {
  const router = useRouter();
  const [data, setData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDrawerOpen, openDrawer, closeDrawer } = useCreateDrawer();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const leads = await MockAPI.getLeads();
      setData(leads);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      destination: "",
      source: "whatsapp",
      status: "new",
      budget: undefined,
      notes: "",
    },
  });

  const onSubmit = async (values: LeadFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("New Lead:", values);
    toast.success("Lead created successfully");
    closeDrawer();
    form.reset();
  };

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "leadRef",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
      cell: ({ row }) => <div className="font-mono text-xs font-medium text-[var(--tf-primary)]">{row.original.leadRef}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">{row.original.name}</span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => <span className="font-medium text-[var(--tf-text-secondary)]">{row.original.destination}</span>,
    },
    {
      accessorKey: "budget",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Budget" />,
      cell: ({ row }) => (
        <div className="text-[var(--tf-text-primary)]">
          {row.original.budget ? `₨ ${row.original.budget.toLocaleString()}` : "-"}
        </div>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => <span className="capitalize text-[var(--tf-text-secondary)]">{row.original.source.replace('_', ' ')}</span>,
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
          onView={() => router.push(`/leads/${row.original.leadRef}`)} 
          onEdit={() => {
            openDrawer();
            toast.success(`Editing lead ${row.original.name}`);
          }}
          onDelete={() => console.log("Delete", row.original.id)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Leads</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage and track your prospective customers.</p>
        </div>
        <Button 
          onClick={openDrawer}
          className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Lead
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState 
          icon={UserPlus} 
          title="No leads found" 
          description="You haven't added any leads yet. Create your first lead to start tracking your sales pipeline."
          action={{ label: "Add New Lead", onClick: openDrawer }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm p-6">
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
                options: [
                  { label: "New", value: "new" },
                  { label: "Contacted", value: "contacted" },
                  { label: "Follow Up", value: "follow_up" },
                  { label: "Interested", value: "interested" },
                  { label: "Converted", value: "converted" },
                  { label: "Lost", value: "lost" },
                ]
              }
            ]}
          />
        </div>
      )}

      <DrawerForm
        title="Add New Lead"
        description="Create a new lead inquiry to start tracking them in your pipeline."
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="md"
        submitLabel="Create Lead"
      >
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" label="Full Name" placeholder="e.g. Ahmed Raza" />
              <FormField control={form.control} name="phone" label="Phone Number" type="tel" placeholder="e.g. 0300 1234567" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="destination" label="Destination" placeholder="e.g. Dubai, Umrah" />
              <FormField control={form.control} name="budget" label="Budget (PKR)" type="number" placeholder="e.g. 150000" />
            </div>

            <FormTextArea control={form.control} name="notes" label="Notes / Requirements" placeholder="Enter any specific requirements or notes..." />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
