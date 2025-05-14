import { sql } from 'drizzle-orm';

/**
 * Safely bind a vector array to a SQL query
 * @param array The array to bind as a vector
 * @returns A SQL fragment with properly bound parameters
 */
export function bindVector(array: number[]) {
  // Use SQL parameter binding instead of JSON.stringify
  return sql`array[${sql.join(array.map(value => sql`${value}`), sql`, `)}]::vector`;
}

/**
 * Safely bind a JSONB array to a SQL query
 * @param array The array to bind as JSONB
 * @returns A SQL fragment with properly bound parameters
 */
export function bindJsonbArray(array: number[]) {
  // Use SQL parameter binding instead of JSON.stringify
  return sql`array[${sql.join(array.map(value => sql`${value}`), sql`, `)}]::jsonb`;
}