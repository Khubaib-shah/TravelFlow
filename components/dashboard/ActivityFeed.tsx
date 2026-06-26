"use client";

import { CheckCircle2, Ticket, Users, FileText, UserPlus, CreditCard, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatTimeAgo } from "@/lib/utils";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Button } from "@/components/ui/button";

type ActivityType = "booking" | "invoice" | "lead" | "expense" | "customer";
type FilterPeriod = "today" | "yesterday" | "week" | "all";

interface Activity {
  id: number;
  type: ActivityType;
  icon: React.ElementType;
  color: string;
  title: string;
  detail: string;
  time: Date;
  href?: string;
}

const ALL_ACTIVITIES: Activity[] = [
  { id: 1, type: "booking", icon: Ticket, color: "var(--tf-primary)", title: "Ali Ahmed created booking", detail: "KHI → DXB (Emirates)", time: new Date(Date.now() - 1000 * 60 * 10), href: "/bookings/bk-1" },
  { id: 2, type: "invoice", icon: CheckCircle2, color: "var(--tf-success)", title: "Sara confirmed invoice", detail: "#INV-2024-441", time: new Date(Date.now() - 1000 * 60 * 60), href: "/bookings" },
  { id: 3, type: "lead", icon: UserPlus, color: "var(--tf-warning)", title: "Usman added a new lead", detail: "Umrah Package Inquiry", time: new Date(Date.now() - 1000 * 60 * 60 * 3), href: "/leads/LD-2024-003" },
  { id: 4, type: "expense", icon: CreditCard, color: "var(--tf-danger)", title: "Expense logged", detail: "Office Rent — Rs 85,000", time: new Date(Date.now() - 1000 * 60 * 60 * 5), href: "/expenses" },
  { id: 5, type: "customer", icon: Users, color: "var(--tf-info)", title: "New customer registered", detail: "Ahmed Raza (Individual)", time: new Date(Date.now() - 1000 * 60 * 60 * 8), href: "/customers/cust-1" },
  { id: 6, type: "booking", icon: Ticket, color: "var(--tf-primary)", title: "Payment received", detail: "BK-2024-002 — Rs 1,00,000", time: new Date(Date.now() - 1000 * 60 * 60 * 12), href: "/bookings/bk-2" },
  { id: 7, type: "lead", icon: UserPlus, color: "var(--tf-warning)", title: "Lead status updated", detail: "Sara Khan — Interested", time: new Date(Date.now() - 1000 * 60 * 60 * 22), href: "/leads/LD-2024-002" },
  { id: 8, type: "booking", icon: Ticket, color: "var(--tf-primary)", title: "Booking completed", detail: "BK-2024-003 Jeddah trip", time: new Date(Date.now() - 1000 * 60 * 60 * 26), href: "/bookings/bk-3" },
  { id: 9, type: "customer", icon: Users, color: "var(--tf-info)", title: "Customer profile updated", detail: "Usman Ali — passport renewed", time: new Date(Date.now() - 1000 * 60 * 60 * 30), href: "/customers/cust-3" },
  { id: 10, type: "expense", icon: FileText, color: "var(--tf-danger)", title: "Expense approved", detail: "Internet & Utilities", time: new Date(Date.now() - 1000 * 60 * 60 * 48), href: "/expenses" },
];

const PERIOD_CUTOFFS: Record<FilterPeriod, number> = {
  today: Date.now() - 1000 * 60 * 60 * 24,
  yesterday: Date.now() - 1000 * 60 * 60 * 48,
  week: Date.now() - 1000 * 60 * 60 * 24 * 7,
  all: 0,
};

export function ActivityFeed({ isLoading }: { isLoading: boolean }) {
  const [period, setPeriod] = useState<FilterPeriod>("week");
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const cutoff = PERIOD_CUTOFFS[period];
    return ALL_ACTIVITIES.filter(a => a.time.getTime() >= cutoff);
  }, [period]);

  const displayed = showAll ? filtered : filtered.slice(0, 5);

  return (
    <div className="bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-xl p-6 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="tf-h3 text-[var(--tf-text-primary)]">Recent Activity</h3>
          <p className="text-sm text-[var(--tf-text-secondary)]">Latest actions across branches</p>
        </div>
        <FilterSelect
          value={period}
          onValueChange={(v) => { setPeriod(v as FilterPeriod); setShowAll(false); }}
          options={[
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Last 48h" },
            { value: "week", label: "This Week" },
            { value: "all", label: "All Time" },
          ]}
          triggerClassName="bg-[var(--tf-surface-2)] rounded-lg"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--tf-surface-2)] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 w-3/4 bg-[var(--tf-surface-2)] animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-[var(--tf-surface-2)] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-[var(--tf-text-muted)] mb-3 opacity-40" />
          <p className="text-[var(--tf-text-secondary)] text-sm">No activity in this period</p>
        </div>
      ) : (
        <>
          {/* Scrollable activity list */}
          <div className="overflow-y-auto max-h-[340px] space-y-1 pr-1 scrollbar-thin">
            {displayed.map((activity, index) => {
              const Icon = activity.icon;
              const isLast = index === displayed.length - 1;
              return (
                <div
                  key={activity.id}
                  onClick={() => activity.href && router.push(activity.href)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                    activity.href ? "cursor-pointer hover:bg-[var(--tf-surface-2)]" : ""
                  }`}
                >
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--tf-surface)] shadow-sm"
                      style={{ backgroundColor: `${activity.color}22`, color: activity.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {!isLast && (
                      <div className="w-px h-full min-h-[12px] mt-1 bg-[var(--tf-border)]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-[var(--tf-text-primary)] truncate leading-tight">
                      {activity.title}
                    </p>
                    <p className="text-xs text-[var(--tf-text-secondary)] truncate mt-0.5">
                      {activity.detail}
                    </p>
                    <p className="text-[10px] text-[var(--tf-text-muted)] mt-1">
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more / View all */}
          {filtered.length > 5 && (
            <div className="mt-3 pt-3 border-t border-[var(--tf-border)]">
              {!showAll ? (
                <Button
                  variant="link"
                  onClick={() => setShowAll(true)}
                  className="flex w-full items-center justify-center gap-1.5 py-1 normal-case tracking-normal group"
                >
                  Show all {filtered.length} activities
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowAll(false)}
                  className="flex w-full items-center justify-center gap-1.5 py-1 normal-case tracking-normal"
                >
                  Show less
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
