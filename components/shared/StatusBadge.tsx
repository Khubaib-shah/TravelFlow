import { STATUS_STYLES, StatusType } from "@/constants/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || { bg: 'var(--tf-surface-2)', text: 'var(--tf-text-secondary)', label: status };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-[var(--radius-full)] whitespace-nowrap",
        size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 tf-caption",
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {style.label}
    </span>
  );
}
