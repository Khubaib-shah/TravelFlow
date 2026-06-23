import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPKR = (amount: number) => {
  return `₨ ${amount.toLocaleString('en-PK')}`
}

export const formatShort = (amount: number) => {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`
  }
  return `${(amount / 1000).toFixed(0)}K`
}

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}
