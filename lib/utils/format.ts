/**
 * Utility for institutional number formatting
 * Protocol: 
 * - Use 'B' for Billions, 'M' for Millions
 * - No trailing .0
 * - No long strings of zeros
 */
export function formatCurrency(value: number): string {
  if (!value && value !== 0) return 'N/A';
  
  if (value >= 1000000000) {
    const formatted = (value / 1000000000).toFixed(1);
    return `$${formatted.replace(/\.0$/, '')}B`;
  }
  
  if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    return `$${formatted.replace(/\.0$/, '')}M`;
  }
  
  return `$${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  if (!value && value !== 0) return '0';
  return value.toLocaleString();
}
