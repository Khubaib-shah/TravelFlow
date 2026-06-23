import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a PKR amount — returns ONLY the formatted number string, no prefix.
 * Use `formatCurrencyPKR` for a complete Rs-prefixed string.
 */
export const formatPKR = (amount: number): string => {
  return amount.toLocaleString('en-PK');
}

/**
 * Format a number in human-readable PKR shorthand:
 * 1,000 → 1K | 10,000 → 10K | 100,000 → 1 Lac | 1,000,000 → 10 Lac | 10,000,000 → 1 Crore
 */
export const formatShort = (amount: number): string => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10_000_000) {
    const val = abs / 10_000_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Cr`;
  }
  if (abs >= 100_000) {
    const val = abs / 100_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Lac`;
  }
  if (abs >= 1_000) {
    const val = abs / 1_000;
    return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return `${sign}${abs}`;
}

/**
 * Full PKR currency string: Rs 4,820,000 or Rs 4.8 Lac (short)
 */
export const formatCurrencyPKR = (amount: number, short = false): string => {
  if (short) {
    return `Rs ${formatShort(amount)}`;
  }
  return `Rs ${formatPKR(amount)}`;
}

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

export const formatTimeAgo = (date: Date | string): string => {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
