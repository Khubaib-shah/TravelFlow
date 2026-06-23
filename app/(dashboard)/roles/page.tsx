"use client";

import { ShieldCheck, Check } from "lucide-react";

const roles = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access to all modules, settings, and user management.",
    permissions: ["Manage Users", "All Branches", "Financial Reports", "System Settings", "Delete Records"],
    color: "var(--tf-danger-soft)",
    textColor: "var(--tf-danger)",
    userCount: 1,
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "Branch-level management with access to sales and reports.",
    permissions: ["Manage Branch Staff", "View Reports", "Approve Expenses", "Manage Bookings"],
    color: "var(--tf-warning-soft)",
    textColor: "var(--tf-warning)",
    userCount: 1,
  },
  {
    id: "role-agent",
    name: "Agent",
    description: "Create and manage leads, bookings, and customers.",
    permissions: ["Manage Leads", "Create Bookings", "View Customers", "Create Invoices"],
    color: "var(--tf-info-soft)",
    textColor: "var(--tf-info)",
    userCount: 1,
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <h1 className="tf-h2 text-[var(--tf-text-primary)]">Roles & Permissions</h1>
        <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage what each role can access across TravelFlow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: role.color }}>
                <ShieldCheck className="w-5 h-5" style={{ color: role.textColor }} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: role.color, color: role.textColor }}>
                {role.userCount} user{role.userCount !== 1 ? "s" : ""}
              </span>
            </div>
            <h3 className="tf-h3 text-[var(--tf-text-primary)] mb-1">{role.name}</h3>
            <p className="tf-body-sm text-[var(--tf-text-secondary)] mb-5">{role.description}</p>

            <div className="space-y-2">
              {role.permissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: role.color }}>
                    <Check className="w-2.5 h-2.5" style={{ color: role.textColor }} />
                  </div>
                  <span className="text-sm text-[var(--tf-text-secondary)]">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
