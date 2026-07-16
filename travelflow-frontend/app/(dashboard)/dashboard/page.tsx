"use client";

import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RecentBookingsTable } from "@/components/dashboard/RecentBookingsTable";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ErrorState } from "@/components/shared/ErrorState";

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch } = useDashboardStats();

  // If the entire dashboard stats request fails, show a recoverable error
  // but each widget is still wrapped in its own ErrorBoundary for render-crash isolation.
  if (error && !data) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Row 1: KPIs */}
      <ErrorBoundary>
        <KpiRow data={data} isLoading={isLoading} />
      </ErrorBoundary>

      {/* Row 2: Charts (Revenue Area + Profit Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <RevenueChart data={data?.sparklines} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1">
          <ErrorBoundary>
            <ProfitChart data={data} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ErrorBoundary>
          <BranchPerformance isLoading={isLoading} data={data?.branchPerformance} />
        </ErrorBoundary>
        <ErrorBoundary>
          <ActivityFeed isLoading={isLoading} activities={data?.recentActivities} />
        </ErrorBoundary>
      </div>

      {/* Row 4: Recent Bookings Table */}
      <div className="w-full">
        <ErrorBoundary>
          <RecentBookingsTable isLoading={isLoading} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
