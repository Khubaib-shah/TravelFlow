import { formatPKR, formatShort, cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  short?: boolean;
  className?: string;
}

export function CurrencyDisplay({ amount, short = false, className }: CurrencyDisplayProps) {
  const formattedAmount = short ? formatShort(amount) : formatPKR(amount);

  return (
    <span className={cn("font-mono font-medium", className)}>
      {short && "₨ "}{formattedAmount}
    </span>
  );
}
