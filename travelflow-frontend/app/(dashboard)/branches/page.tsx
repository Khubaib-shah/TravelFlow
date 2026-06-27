"use client";

import { GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrencyPKR } from "@/lib/utils";

const branches = [
  { id: "br-1", name: "Karachi Main", code: "KHI-HQ", city: "Karachi", isHeadOffice: true, status: "active", revenue: 4820000, bookings: 54 },
  { id: "br-2", name: "Islamabad Branch", code: "ISB-01", city: "Islamabad", isHeadOffice: false, status: "active", revenue: 2340000, bookings: 28 },
  { id: "br-3", name: "Lahore Branch", code: "LHE-01", city: "Lahore", isHeadOffice: false, status: "active", revenue: 1980000, bookings: 22 },
  { id: "br-4", name: "Dubai Office", code: "DXB-01", city: "Dubai", isHeadOffice: false, status: "active", revenue: 3100000, bookings: 31 },
];

export default function BranchesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <h1 className="tf-h2 text-[var(--tf-text-primary)]">Branches</h1>
        <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Manage your office locations across Pakistan and GCC.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            onClick={() => router.push(`/branches/${branch.id}`)}
            className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-2">
                {branch.isHeadOffice && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[var(--tf-primary-soft)] text-[var(--tf-primary)] px-2 py-0.5 rounded-full">
                    HQ
                  </span>
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[var(--tf-success-soft)] text-[var(--tf-success)] px-2 py-0.5 rounded-full">
                  {branch.status}
                </span>
              </div>
            </div>

            <h3 className="tf-h4 text-[var(--tf-text-primary)] mb-1">{branch.name}</h3>
            <p className="tf-caption text-[var(--tf-text-muted)] mb-4">{branch.code} · {branch.city}</p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--tf-border)]">
              <div>
                <p className="tf-caption text-[var(--tf-text-muted)]">Revenue</p>
                <p className="font-semibold text-sm text-[var(--tf-text-primary)]">{formatCurrencyPKR(branch.revenue, true)}</p>
              </div>
              <div>
                <p className="tf-caption text-[var(--tf-text-muted)]">Bookings</p>
                <p className="tf-h4 text-[var(--tf-text-primary)]">{branch.bookings}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
