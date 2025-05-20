/**
 * Formats a date string into MM/DD/YYYY format
 * @param dateString - The date string to format (e.g., '2025-05-20')
 * @returns The formatted date string (e.g., '05/20/2025')
 * @throws Error if the date is invalid
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}
