/**
 * Format a number as GBP currency
 * @param value The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

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

/**
 * Format a date string to a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Format a number with commas for thousands
 * @param value The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(value)
}

/**
 * Format square footage with the appropriate unit
 * @param value Square footage value
 * @returns Formatted square footage string
 */
export function formatSquareFootage(value: number): string {
  return `${formatNumber(value)} sq ft`
}

/**
 * Capitalize the first letter of a string
 * @param value The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
