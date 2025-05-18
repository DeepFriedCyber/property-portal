/**
 * Format a number as GBP currency with optional decimal places
 * @param value The number to format
 * @returns Formatted currency string
 */
export function formatGBP(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(value)
}
