"use client";

import { AreaChart } from "@/components/charts/AreaChart";

export function RevenueChart({ data, isLoading }: { data: any, isLoading: boolean }) {
  // Generate dummy monthly data from sparklines for demonstration
  const chartData = [
    { name: "Jan", revenue: 2400000, profit: 400000 },
    { name: "Feb", revenue: 1398000, profit: 300000 },
    { name: "Mar", revenue: 4800000, profit: 600000 },
    { name: "Apr", revenue: 3908000, profit: 500000 },
    { name: "May", revenue: 4800000, profit: 680000 },
    { name: "Jun", revenue: 3800000, profit: 580000 },
  ];

  return (
    <div className="bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-xl p-6 h-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="tf-h3 text-[var(--tf-text-primary)]">Revenue vs Profit</h3>
          <p className="text-sm text-[var(--tf-text-secondary)]">Last 6 months performance</p>
        </div>
        <select className="bg-[var(--tf-surface-2)] border-[var(--tf-border)] text-sm rounded-md px-3 py-1.5 outline-none">
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="w-full h-[300px] bg-[var(--tf-surface-2)] animate-pulse rounded-md" />
      ) : (
        <AreaChart 
          data={chartData} 
          series={[
            { key: "revenue", color: "var(--tf-primary)", label: "Revenue" },
            { key: "profit", color: "var(--tf-success)", label: "Profit" }
          ]} 
        />
      )}
    </div>
  );
}
