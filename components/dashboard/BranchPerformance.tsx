"use client";

import { BarChart } from "@/components/charts/BarChart";

export function BranchPerformance({ isLoading }: { isLoading: boolean }) {
  const chartData = [
    { name: "KHI Main", revenue: 4820000 },
    { name: "DXB Office", revenue: 3100000 },
    { name: "ISB Branch", revenue: 2340000 },
    { name: "LHE Branch", revenue: 1980000 },
  ];

  return (
    <div className="bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-xl p-6 h-full shadow-sm">
      <h3 className="tf-h3 text-[var(--tf-text-primary)] mb-2">Branch Performance</h3>
      <p className="text-sm text-[var(--tf-text-secondary)] mb-6">Revenue by location</p>

      {isLoading ? (
        <div className="w-full h-[240px] bg-[var(--tf-surface-2)] animate-pulse rounded-md" />
      ) : (
        <BarChart 
          data={chartData} 
          layout="vertical"
          height={240}
          showValueOnBars={true}
          series={[
            { key: "revenue", color: "var(--tf-primary)", label: "Revenue (₨)" }
          ]} 
        />
      )}
    </div>
  );
}
