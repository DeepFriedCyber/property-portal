// Create a regex pattern for sensitive fields detection
const SENSITIVE_FIELDS_REGEX = new RegExp(SENSITIVE_FIELDS.map(f => f.toLowerCase()).join('|'), 'i')

/**
 * Sanitize an object to remove sensitive data before logging
 * @param obj The object to sanitize
 * @param seen WeakSet to track already processed objects (prevents circular references)
 * @returns A sanitized copy of the object
 */
function sanitizeForLogging(obj: unknown, seen = new WeakSet<object>()): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // Handle circular references
  if (seen.has(obj as object)) {
    return '[Circular]'
  }
  seen.add(obj as object)

  // Handle Error objects specially
  if (obj instanceof Error) {
    const errorObj = {
      name: obj.name,
      message: obj.message,
      stack: obj.stack,
    }

    // Also include any custom properties that might be on the error
    const customProps = Object.getOwnPropertyNames(obj)
      .filter(prop => !['name', 'message', 'stack'].includes(prop))
      .reduce(
        (acc, prop) => {
          acc[prop] = (obj as any)[prop]
          return acc
        },
        {} as Record<string, unknown>
      )

    return sanitizeForLogging({ ...errorObj, ...customProps }, seen)
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item, seen))
  }

  // Handle objects
  const sanitized = { ...obj }
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase()

    // Check if this key contains any sensitive terms using regex
    if (SENSITIVE_FIELDS_REGEX.test(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeForLogging(sanitized[key], seen)
    }
  }

  return sanitized
}
