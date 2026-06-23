import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendBadgeProps {
  value: number; // e.g. 12.5 for +12.5%
  label?: string; // e.g. "vs last month"
  className?: string;
}

export function TrendBadge({ value, label, className }: TrendBadgeProps) {
  const isPositive = value >= 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center font-bold px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[11px]",
          isPositive
            ? "bg-[var(--tf-success-soft)] text-[var(--tf-success)]"
            : "bg-[var(--tf-danger-soft)] text-[var(--tf-danger)]"
        )}
      >
        {isPositive ? (
          <ArrowUpRight className="mr-0.5 h-3 w-3" />
        ) : (
          <ArrowDownRight className="mr-0.5 h-3 w-3" />
        )}
        {isPositive ? "+" : ""}{value}%
      </span>
      {label && (
        <span className="tf-caption text-[var(--tf-text-muted)]">{label}</span>
      )}
    </div>
  );
}
