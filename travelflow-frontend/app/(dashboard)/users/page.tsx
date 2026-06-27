"use client";

import { useState, useEffect } from "react";
import { Plus, UserCog } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { User, Branch } from "@/types";
import { MockAPI } from "@/lib/mock-api";
import { DataTable } from "@/components/tables/DataTable";
import { DataTableColumnHeader } from "@/components/tables/DataTableColumnHeader";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { TableEntityLink } from "@/components/shared/TableEntityLink";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormSelect } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { userSchema, UserFormValues } from "@/features/users/schemas/user.schema";
import { useEntityDrawer } from "@/hooks/use-entity-drawer";
import { mapUserToForm, userDefaultValues } from "@/features/users/utils/mapUserToForm";

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "var(--tf-danger-soft)", text: "var(--tf-danger)" },
  manager: { bg: "var(--tf-warning-soft)", text: "var(--tf-warning)" },
  agent: { bg: "var(--tf-info-soft)", text: "var(--tf-info)" },
  accountant: { bg: "var(--tf-success-soft)", text: "var(--tf-success)" },
};

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDrawerOpen, editingId, isEditing, openCreate, openEdit, close } = useEntityDrawer();

  const loadData = async () => {
    setIsLoading(true);
    const [users, branchList] = await Promise.all([MockAPI.getUsers(), MockAPI.getBranches()]);
    setData(users);
    setBranches(branchList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: userDefaultValues,
  });

  const handleOpenCreate = () => {
    form.reset(userDefaultValues);
    openCreate();
  };

  const onSubmit = async (values: UserFormValues) => {
    if (isEditing && editingId) {
      await MockAPI.updateUser(editingId, values);
      toast.success("User updated successfully");
    } else {
      await MockAPI.createUser(values);
      toast.success("User created successfully");
    }
    close();
    form.reset(userDefaultValues);
    await loadData();
  };

  const getBranchName = (branchId: string) =>
    branches.find((b) => b.id === branchId)?.name ?? branchId;

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--tf-primary-soft)] flex items-center justify-center text-[var(--tf-primary)] font-semibold text-sm">
            {row.original.firstName.charAt(0)}
          </div>
          <div>
            <TableEntityLink onClick={() => router.push(`/users/${row.original.id}`)}>
              {row.original.firstName} {row.original.lastName}
            </TableEntityLink>
            <p className="text-xs text-[var(--tf-text-muted)]">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const style = roleColors[row.original.role] ?? { bg: "var(--tf-surface-2)", text: "var(--tf-text-secondary)" };
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: style.bg, color: style.text }}>
            {row.original.role}
          </span>
        );
      },
    },
    {
      accessorKey: "branchId",
      header: "Branch",
      cell: ({ row }) => <span className="text-sm text-[var(--tf-text-secondary)]">{getBranchName(row.original.branchId)}</span>,
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Active",
      cell: ({ row }) => (
        <span className="text-sm text-[var(--tf-text-muted)]">
          {row.original.lastLoginAt ? new Date(row.original.lastLoginAt).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tf-success)] capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--tf-success)] inline-block" />
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/users/${row.original.id}`)}
          onEdit={() => {
            form.reset(mapUserToForm(row.original));
            openEdit(row.original.id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Users</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage team members and their access across branches.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {(!isLoading && data.length === 0) ? (
        <EmptyState
          icon={UserCog}
          title="No users yet"
          description="Add team members and assign roles to manage access across branches."
          action={{ label: "Add User", onClick: handleOpenCreate }}
        />
      ) : (
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm overflow-hidden p-6">
          <DataTable columns={columns} data={data} searchKey="firstName" searchPlaceholder="Search users..." isLoading={isLoading} />
        </div>
      )}

      <DrawerForm
        title={isEditing ? "Edit User" : "Add User"}
        description={isEditing ? "Update user profile, role, and branch assignment." : "Create a new team member and assign their role."}
        isOpen={isDrawerOpen}
        onClose={close}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={form.formState.isSubmitting}
        size="md"
        submitLabel={isEditing ? "Save Changes" : "Create User"}
      >
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" label="First Name" required />
              <FormField control={form.control} name="lastName" label="Last Name" required />
            </div>
            <FormField control={form.control} name="email" label="Email" type="email" required />
            <FormField control={form.control} name="phone" label="Phone" type="tel" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect control={form.control} name="role" label="Role" required options={[
                { label: "Admin", value: "admin" },
                { label: "Manager", value: "manager" },
                { label: "Agent", value: "agent" },
                { label: "Accountant", value: "accountant" },
              ]} />
              <FormSelect control={form.control} name="branchId" label="Branch" required options={branches.map((b) => ({
                label: b.name,
                value: b.id,
              }))} />
            </div>
            <FormSelect control={form.control} name="status" label="Status" required options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Invited", value: "invited" },
            ]} />
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
