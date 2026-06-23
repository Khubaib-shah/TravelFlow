"use client";

import { UserCog } from "lucide-react";

const users = [
  { id: "user-1", name: "Ahmad Khan", email: "ahmad@agency.com", role: "Admin", branch: "Karachi Main", status: "active", lastLogin: "2 hours ago" },
  { id: "user-2", name: "Sara Ali", email: "sara@agency.com", role: "Agent", branch: "Islamabad Branch", status: "active", lastLogin: "1 day ago" },
  { id: "user-3", name: "Usman Tariq", email: "usman@agency.com", role: "Manager", branch: "Karachi Main", status: "active", lastLogin: "3 hours ago" },
];

const roleColors: Record<string, { bg: string; text: string }> = {
  Admin: { bg: "var(--tf-danger-soft)", text: "var(--tf-danger)" },
  Manager: { bg: "var(--tf-warning-soft)", text: "var(--tf-warning)" },
  Agent: { bg: "var(--tf-info-soft)", text: "var(--tf-info)" },
  Accountant: { bg: "var(--tf-success-soft)", text: "var(--tf-success)" },
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <h1 className="tf-h2 text-[var(--tf-text-primary)]">Users</h1>
        <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage team members and their access across branches.</p>
      </div>

      <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--tf-surface-2)]">
            <tr>
              {["User", "Role", "Branch", "Last Active", "Status"].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--tf-text-muted)]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--tf-border)]">
            {users.map((user, i) => {
              const roleStyle = roleColors[user.role] || { bg: "var(--tf-surface-2)", text: "var(--tf-text-secondary)" };
              return (
                <tr key={user.id} className={`hover:bg-[var(--tf-primary-soft)] transition-colors ${i % 2 === 1 ? "bg-[var(--tf-surface-2)]/40" : ""}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--tf-primary-soft)] flex items-center justify-center text-[var(--tf-primary)] font-semibold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[var(--tf-text-primary)]">{user.name}</p>
                        <p className="text-xs text-[var(--tf-text-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--tf-text-secondary)]">{user.branch}</td>
                  <td className="px-4 py-4 text-sm text-[var(--tf-text-muted)]">{user.lastLogin}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tf-success)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--tf-success)] inline-block"></span>
                      Active
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
