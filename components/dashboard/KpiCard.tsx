import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { TrendBadge } from "../shared/TrendBadge";

export interface KpiCardProps {
  label: string;
  value: number | string;
  prefix?: string;            // "₨" for currency
  trend?: number;             // +12.5 or -3.2
  trendLabel?: string;        // "vs last month"
  icon: LucideIcon;
  cardColor: 'blue' | 'teal' | 'amber' | 'violet' | 'slate' | 'coral';
  sparklineData?: number[];   // 7 values (mocking chart for now)
  isLoading?: boolean;
  onClick?: () => void;
}

const colorMap = {
  blue:   { bg: "bg-[var(--tf-card-blue)]",   iconBg: "bg-blue-100 dark:bg-blue-900/30",       iconColor: "text-blue-600 dark:text-blue-400" },
  teal:   { bg: "bg-[var(--tf-card-teal)]",   iconBg: "bg-teal-100 dark:bg-teal-900/30",       iconColor: "text-teal-600 dark:text-teal-400" },
  amber:  { bg: "bg-[var(--tf-card-amber)]",  iconBg: "bg-amber-100 dark:bg-amber-900/30",     iconColor: "text-amber-600 dark:text-amber-400" },
  violet: { bg: "bg-[var(--tf-card-violet)]", iconBg: "bg-violet-100 dark:bg-violet-900/30",   iconColor: "text-violet-600 dark:text-violet-400" },
  slate:  { bg: "bg-[var(--tf-card-slate)]",  iconBg: "bg-slate-200 dark:bg-slate-800",        iconColor: "text-slate-600 dark:text-slate-400" },
  coral:  { bg: "bg-[var(--tf-card-coral)]",  iconBg: "bg-rose-100 dark:bg-rose-900/30",       iconColor: "text-rose-600 dark:text-rose-400" },
};

export function KpiCard({
  label,
  value,
  prefix,
  trend,
  trendLabel,
  icon: Icon,
  cardColor,
  sparklineData,
  onClick
}: KpiCardProps) {
  const styles = colorMap[cardColor];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-[var(--tf-border)] p-5 transition-shadow",
        styles.bg,
        onClick && "cursor-pointer hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="tf-body-sm font-semibold text-[var(--tf-text-secondary)]">{label}</span>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", styles.iconBg)}>
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-1 min-w-0 overflow-hidden">
          {prefix && <span className="tf-h3 text-[var(--tf-text-secondary)] shrink-0">{prefix}</span>}
          {typeof value === 'number' && prefix === '₨' ? (
             <CurrencyDisplay amount={value} className="tf-kpi-value text-[var(--tf-text-primary)] truncate" />
          ) : (
            <span className="tf-kpi-value text-[var(--tf-text-primary)] truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {trend !== undefined && (
          <TrendBadge value={trend} label={trendLabel} />
        )}
        
        {/* Sparkline placeholder for now */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-4 w-16 opacity-50 flex items-end justify-between gap-[2px]">
            {sparklineData.map((val, i) => {
              const max = Math.max(...sparklineData);
              const height = Math.max((val / max) * 100, 10);
              return (
                <div 
                  key={i} 
                  className={cn("w-1 rounded-t-sm", styles.iconBg)}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
