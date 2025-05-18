/**
 * Validation helper functions for API parameters
 */

/**
 * Validates if a string is a valid UUID v4
 * @param id The string to validate
 * @returns Boolean indicating if the string is a valid UUID
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validates if a string is a valid integer
 * @param value The string to validate
 * @returns Boolean indicating if the string is a valid integer
 */
export function isValidInteger(value: string): boolean {
  return /^-?\d+$/.test(value)
}

/**
 * Validates if a string is a valid positive integer
 * @param value The string to validate
 * @returns Boolean indicating if the string is a valid positive integer
 */
export function isValidPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && parseInt(value, 10) > 0
}

/**
 * Validates if a string is a valid ID based on the expected format
 * @param id The ID to validate
 * @param format The expected format ('uuid' or 'integer')
 * @returns Boolean indicating if the ID is valid
 */
export function isValidId(id: string | null, format: 'uuid' | 'integer' = 'uuid'): boolean {
  if (!id) return false

  return format === 'uuid' ? isValidUuid(id) : isValidInteger(id)
}
