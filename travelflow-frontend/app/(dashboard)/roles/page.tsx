"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Check, Pencil } from "lucide-react";
import { toast } from "sonner";

import { User } from "@/types";
import { Role, ALL_PERMISSIONS } from "@/types/role";
import { MockAPI } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const [roleList, userList] = await Promise.all([MockAPI.getRoles(), MockAPI.getUsers()]);
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
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!editingRole) return;
    setIsSaving(true);
    await MockAPI.updateRolePermissions(editingRole.id, selectedPermissions);
    toast.success(`Permissions updated for ${editingRole.name}`);
    setEditOpen(false);
    setEditingRole(null);
    setIsSaving(false);
    await loadData();
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
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <h1 className="tf-h2 text-[var(--tf-text-primary)]">Roles & Permissions</h1>
        <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage what each role can access across TravelFlow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: role.color }}>
                <ShieldCheck className="w-5 h-5" style={{ color: role.textColor }} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: role.color, color: role.textColor }}>
                {getUserCount(role.name)} user{getUserCount(role.name) !== 1 ? "s" : ""}
              </span>
            </div>
            <h3 className="tf-h3 text-[var(--tf-text-primary)] mb-1">{role.name}</h3>
            <p className="tf-body-sm text-[var(--tf-text-secondary)] mb-5">{role.description}</p>

            <div className="space-y-2 flex-1">
              {role.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: role.color }}>
                    <Check className="w-2.5 h-2.5" style={{ color: role.textColor }} />
                  </div>
                  <span className="text-sm text-[var(--tf-text-secondary)]">{perm}</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-5 w-full border-[var(--tf-border)]"
              onClick={() => openEditPermissions(role)}
            >
              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Permissions
            </Button>
          </div>
        ))}
      </div>

      <DrawerForm
        title={`Edit Permissions — ${editingRole?.name ?? ""}`}
        description="Toggle permissions for this role. Changes apply to all users with this role."
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        isSubmitting={isSaving}
        size="md"
        submitLabel="Save Permissions"
      >
        <div className="grid grid-cols-1 gap-3">
          {ALL_PERMISSIONS.map((perm) => (
            <div key={perm} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)]">
              <Checkbox
                id={perm}
                checked={selectedPermissions.includes(perm)}
                onCheckedChange={() => togglePermission(perm)}
              />
              <Label htmlFor={perm} className="text-sm font-normal normal-case tracking-normal cursor-pointer flex-1">
                {perm}
              </Label>
            </div>
          ))}
        </div>
      </DrawerForm>
    </div>
  );
}
