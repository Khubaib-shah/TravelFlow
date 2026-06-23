import { formatCurrencyPKR, formatShort, formatPKR, cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  /** If true, shows compact notation (e.g. Rs 4.8 Lac) */
  short?: boolean;
  className?: string;
}

/**
 * Renders a PKR currency value. Handles prefix internally — never double-prefix.
 * short=false → "Rs 4,820,000"
 * short=true  → "Rs 4.8 Lac"
 */
export function CurrencyDisplay({ amount, short = false, className }: CurrencyDisplayProps) {
  return (
    <span className={cn("font-mono font-medium tabular-nums", className)}>
      {formatCurrencyPKR(amount, short)}
    </span>
  );
}
