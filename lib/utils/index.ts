import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrencyCompact, formatCurrency, formatDate } from "./format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatCurrencyCompact, formatCurrency, formatDate };
