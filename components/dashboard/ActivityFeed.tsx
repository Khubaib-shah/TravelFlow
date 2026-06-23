"use client";

import { CheckCircle2, Ticket, Users, FileText } from "lucide-react";

export function ActivityFeed({ isLoading }: { isLoading: boolean }) {
  const activities = [
    { id: 1, icon: Ticket, color: "var(--tf-primary)", title: "Ali Ahmed created booking", detail: "KHI → DXB (Emirates)", time: "10 mins ago" },
    { id: 2, icon: CheckCircle2, color: "var(--tf-success)", title: "Sara confirmed invoice", detail: "#INV-2024-441", time: "1 hour ago" },
    { id: 3, icon: Users, color: "var(--tf-warning)", title: "Usman added a new lead", detail: "Umrah Package Inquiry", time: "3 hours ago" },
    { id: 4, icon: FileText, color: "var(--tf-info)", title: "Expense logged", detail: "Office Rent - May 2024", time: "5 hours ago" },
  ];

  return (
    <div className="bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-xl p-6 h-full shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="tf-h3 text-[var(--tf-text-primary)]">Recent Activity</h3>
          <p className="text-sm text-[var(--tf-text-secondary)]">Latest actions across branches</p>
        </div>
        <select className="bg-[var(--tf-surface-2)] border-[var(--tf-border)] text-sm rounded-md px-3 py-1.5 outline-none">
          <option>Today</option>
          <option>Yesterday</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex-1 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--tf-surface-2)] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-[var(--tf-surface-2)] animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-[var(--tf-surface-2)] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--tf-border)] before:to-transparent">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[var(--tf-surface)] bg-[var(--tf-surface-2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10" style={{ color: activity.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[var(--tf-surface-2)] p-3 rounded-lg border border-[var(--tf-border)] shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-[var(--tf-text-primary)]">{activity.title}</span>
                  </div>
                  <div className="text-xs text-[var(--tf-text-secondary)] mb-2">{activity.detail}</div>
                  <div className="text-xs text-[var(--tf-text-muted)]">{activity.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
