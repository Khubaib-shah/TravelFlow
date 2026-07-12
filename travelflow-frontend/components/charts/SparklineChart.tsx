"use client";

import { Line, LineChart as RechartsLineChart, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}

export function SparklineChart({ data, color, height = 30, width = 80 }: SparklineChartProps) {
  // Format data for recharts
  const chartData = data.map((val, i) => ({ value: val, index: i }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <RechartsLineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
