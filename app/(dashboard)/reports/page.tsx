"use client";

import { BarChart3, TrendingUp, DollarSign, GitBranch } from "lucide-react";
import Link from "next/link";

const reportCards = [
  {
    icon: TrendingUp,
    title: "Revenue Report",
    description: "Monthly and yearly revenue trends across all branches.",
    href: "/reports/revenue",
    color: "var(--tf-card-amber)",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: DollarSign,
    title: "Profit Report",
    description: "Net profit breakdown by service type and branch.",
    href: "/reports/profit",
    color: "var(--tf-card-violet)",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    icon: GitBranch,
    title: "Branch Performance",
    description: "Side-by-side comparison of branch KPIs and rankings.",
    href: "/reports/branches",
    color: "var(--tf-card-blue)",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--tf-surface)] p-6 rounded-xl border border-[var(--tf-border)] shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="tf-h2 text-[var(--tf-text-primary)]">Reports & Analytics</h1>
            <p className="tf-body text-[var(--tf-text-secondary)]">Business intelligence and performance insights.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="block bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
              style={{ backgroundColor: card.color }}
            >
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <h3 className="tf-h4 text-[var(--tf-text-primary)] mb-2 group-hover:text-[var(--tf-primary)] transition-colors">
                {card.title}
              </h3>
              <p className="tf-body-sm text-[var(--tf-text-secondary)]">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
