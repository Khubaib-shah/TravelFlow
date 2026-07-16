"use client";

import { useEffect, useState, useCallback } from "react";
import { API } from "@/lib/data-source";
import { useInvalidationStore } from "@/store/invalidation.store";
import { DashboardStats } from "@/types";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RecentBookingsTable } from "@/components/dashboard/RecentBookingsTable";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lastUpdated = useInvalidationStore((state) => state.lastUpdated);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = await API.getDashboardStats();
      setData(stats);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, lastUpdated]);

  return (
    <div className="space-y-6">
      {/* Row 1: KPIs */}
      <KpiRow data={data} isLoading={isLoading} />

      {/* Row 2: Charts (Revenue Area + Profit Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.sparklines} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <ProfitChart data={data} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <BranchPerformance isLoading={isLoading} data={data?.branchPerformance} />
        <ActivityFeed isLoading={isLoading} activities={data?.recentActivities} />
      </div>

      {/* Row 4: Recent Bookings Table */}
      <div className="w-full">
        <RecentBookingsTable isLoading={isLoading} />
      </div>
    </div>
  );
}
