const abs = Math.abs;

/**
 * Formats USD cent values into compact human-readable strings (K, M, B, T).
 *
 * DATABASE CONVENTION: All monetary amounts are stored in USD cents.
 *   - funding_raised column is BIGINT (cents, not dollars)
 *   - get_archive_stats RPC returns SUM(funding_raised) in cents
 *   - Example: Quibi raised $1.75B → stored as 175,000,000,000 cents
 *
 * This function converts cents to dollars before formatting.
 */
export function formatCurrencyCompact(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  if (value === 0) return '$0';

  const sign = value < 0 ? '-' : '';
  const dollars = abs(value) / 100;

  if (dollars >= 1e12) return `${sign}$${+(dollars / 1e12).toFixed(2)}T`;
  if (dollars >= 1e9) return `${sign}$${+(dollars / 1e9).toFixed(2)}B`;
  if (dollars >= 1e6) return `${sign}$${+(dollars / 1e6).toFixed(0)}M`;
  if (dollars >= 1e3) return `${sign}$${+(dollars / 1e3).toFixed(0)}K`;
  return `${sign}$${dollars}`;
}

/**
 * Accepts dollar amounts (not cents) and delegates to formatCurrencyCompact.
 * Use this when the value is from an external API or calculation in dollars.
 */
export function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return formatCurrencyCompact(value * 100);
}

/**
 * Converts cents to dollars without formatting. Useful for manual string interpolation.
 */
export function centsToDollars(cents?: number | null): number {
  return (cents ?? 0) / 100;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}
