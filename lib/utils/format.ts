/**
 * Formats monetary values into compact human-readable abbreviations (K, M, B, T).
 * Never displays large numbers with long strings of zeros.
 * 
 * Examples:
 * $1,200,000,000 -> $1.2B
 * $43,000,000    -> $43M
 */
export function formatCurrencyCompact(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A';
  }

  if (value === 0) return '$0';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  const format = (num: number, suffix: string) =>
    `${sign}$${parseFloat(num.toFixed(2))}${suffix}`;

  if (abs >= 1e12) return format(abs / 1e12, 'T');
  if (abs >= 1e9) return format(abs / 1e9, 'B');
  if (abs >= 1e6) return format(abs / 1e6, 'M');
  if (abs >= 1e3) return format(abs / 1e3, 'K');

  return `${sign}$${abs}`;
}

/**
 * Global currency formatter.
 * Now strictly uses formatCurrencyCompact to ensure consistent abbreviations.
 */
export function formatCurrency(value?: number | null): string {
  return formatCurrencyCompact(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  } catch (e) {
    return dateStr;
  }
}
