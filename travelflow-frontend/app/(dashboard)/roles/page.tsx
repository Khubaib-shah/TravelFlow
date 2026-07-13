"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";

import { User } from "@/types";
import { Role, ALL_PERMISSIONS } from "@/types/role";
import { API } from "@/lib/data-source";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/forms/FormField";

const roleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(3),
  textColor: z.string().min(3),
});
type RoleFormValues = z.infer<typeof roleSchema>;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      textColor: "#ffffff",
    },
  });

  const loadData = async () => {
    setIsLoading(true);
    const [roleList, userList] = await Promise.all([
      API.getRoles(),
      API.getUsers(),
    ]);
    setRoles(roleList);
    setUsers(userList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserCount = (roleName: string) => {
    const roleKey = roleName.toLowerCase() as User["role"];
    return users.filter((u) => u.role === roleKey).length;
  };

  const openEditPermissions = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions([...role.permissions]);
    setEditOpen(true);
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleSave = async () => {
    if (!editingRole) return;
    setIsSaving(true);
    await API.updateRolePermissions(editingRole.id, selectedPermissions);
    toast.success(`Permissions updated for ${editingRole.name}`);
    setEditOpen(false);
    setEditingRole(null);
    setIsSaving(false);
    await loadData();
  };

  const handleCreateRole = async (values: RoleFormValues) => {
    setIsSaving(true);
    await API.createRole({ ...values, permissions: selectedPermissions });
    toast.success("Role created successfully");
    setCreateOpen(false);
    form.reset();
    setSelectedPermissions([]);
    setIsSaving(false);
    await loadData();
  };

  const handleDeleteRole = async (role: Role) => {
    if (confirm(`Are you sure you want to delete the role ${role.name}?`)) {
      await API.deleteRole(role.id);
      toast.success("Role deleted");
      await loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tf-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-tf-surface p-6 rounded-xl border border-tf-border shadow-sm">
        <div>
          <h1 className="tf-h2 text-tf-text-primary">Roles & Permissions</h1>
          <p className="tf-body text-tf-text-secondary mt-1">
            Manage what each role can access across TravelFlow.
          </p>
        </div>
        <Button
          onClick={() => {
            form.reset();
            setSelectedPermissions([]);
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-tf-surface rounded-xl border border-tf-border p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: role.color }}
              >
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: role.textColor }}
                />
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ backgroundColor: role.color, color: role.textColor }}
              >
                {getUserCount(role.name)} user
                {getUserCount(role.name) !== 1 ? "s" : ""}
              </span>
            </div>
            <h3 className="tf-h3 text-tf-text-primary mb-1">{role.name}</h3>
            <p className="tf-body-sm text-tf-text-secondary mb-5">
              {role.description}
            </p>

            <div className="space-y-2 flex-1">
              {role.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: role.color }}
                  >
                    <Check
                      className="w-2.5 h-2.5"
                      style={{ color: role.textColor }}
                    />
                  </div>
                  <span className="text-sm text-tf-text-secondary">{perm}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-tf-border"
                onClick={() => openEditPermissions(role)}
              >
                <Pencil className="w-3.5 h-3.5 mr-2" /> Permissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-tf-border text-tf-danger hover:text-tf-danger hover:bg-tf-danger-soft"
                onClick={() => handleDeleteRole(role)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DrawerForm
        title={`Edit Permissions — ${editingRole?.name ?? ""}`}
        description="Toggle permissions for this role. Changes apply to all users with this role."
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        isSubmitting={isSaving}
        size="md"
        submitLabel="Save Permissions"
      >
        <div className="grid grid-cols-1 gap-3">
          {ALL_PERMISSIONS.map((perm) => (
            <div
              key={perm}
              className="flex items-center gap-3 p-3 rounded-lg border border-tf-border hover:bg-[var(--tf-surface-2)]"
            >
              <Checkbox
                id={`edit-${perm}`}
                checked={selectedPermissions.includes(perm)}
                onCheckedChange={() => togglePermission(perm)}
              />
              <Label
                htmlFor={`edit-${perm}`}
                className="text-sm font-normal normal-case tracking-normal cursor-pointer flex-1"
              >
                {perm}
              </Label>
            </div>
          ))}
        </div>
      </DrawerForm>

      <DrawerForm
        title="Create New Role"
        description="Define a new role and its permissions."
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={form.handleSubmit(handleCreateRole)}
        isSubmitting={isSaving}
        size="md"
        submitLabel="Create Role"
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              label="Role Name"
              required
            />
            <FormField
              control={form.control}
              name="description"
              label="Description"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                label="Background Color"
                type="color"
              />
              <FormField
                control={form.control}
                name="textColor"
                label="Text Color"
                type="color"
              />
            </div>

            <div className="pt-4 border-t border-tf-border mt-6">
              <h3 className="text-sm font-medium mb-3">Permissions</h3>
              <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-3 p-3 rounded-lg border border-tf-border hover:bg-[var(--tf-surface-2)]"
                  >
                    <Checkbox
                      id={`create-${perm}`}
                      checked={selectedPermissions.includes(perm)}
                      onCheckedChange={() => togglePermission(perm)}
                    />
                    <Label
                      htmlFor={`create-${perm}`}
                      className="text-sm font-normal normal-case tracking-normal cursor-pointer flex-1"
                    >
                      {perm}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Form>
      </DrawerForm>
    </div>
  );
}
