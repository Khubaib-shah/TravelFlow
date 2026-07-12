"use client";

import { AreaChart } from "@/components/charts/AreaChart";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { useState } from "react";

export function RevenueChart({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const [period, setPeriod] = useState("6m");
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
    <div className="bg-[var(--tf-surface)] border border-tf-border rounded-xl p-6 h-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="tf-h3 text-tf-text-primary">Revenue vs Profit</h3>
          <p className="text-sm text-tf-text-secondary">
            Last 6 months performance
          </p>
        </div>
        <FilterSelect
          value={period}
          onValueChange={setPeriod}
          options={[
            { value: "6m", label: "Last 6 Months" },
            { value: "year", label: "This Year" },
          ]}
          triggerClassName="bg-[var(--tf-surface-2)] rounded-md"
        />
      </div>

      {isLoading ? (
        <div className="w-full h-[300px] bg-[var(--tf-surface-2)] animate-pulse rounded-md" />
      ) : (
        <AreaChart
          data={chartData}
          series={[
            { key: "revenue", color: "var(--tf-primary)", label: "Revenue" },
            { key: "profit", color: "var(--tf-success)", label: "Profit" },
          ]}
        />
      )}
    </div>
  );
}
