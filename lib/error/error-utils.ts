/**
 * Utility functions for safe error handling
 */

/**
 * Safely converts any error to a string representation
 * @param error Any type of error
 * @returns A string representation of the error
 */
export function normalizeError(error: unknown): string {
  return String(error)
}

/**
 * Safely extracts the message from any error type
 * @param error Any type of error
 * @returns The error message as a string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * Safely extracts structured information from any error type
 * @param error Any type of error
 * @returns An object containing error details
 */
export function getErrorDetails(error: unknown): {
  message: string
  stack?: string
  code?: string
  name?: string
  status?: number
  type?: string
} {
  // Handle Error objects
  if (error instanceof Error) {
    const details: Record<string, any> = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    }

    // Extract additional properties that might exist on error objects
    // Common properties in various error types
    const errorObj = error as any
    if ('code' in errorObj) details.code = String(errorObj.code)
    if ('status' in errorObj) details.status = Number(errorObj.status)
    if ('statusCode' in errorObj) details.status = Number(errorObj.statusCode)
    if ('type' in errorObj) details.type = String(errorObj.type)

    return details
  }

  // Handle non-Error objects
  if (error !== null && typeof error === 'object') {
    try {
      const errorObj = error as Record<string, any>
      return {
        message: errorObj.message ? String(errorObj.message) : JSON.stringify(error),
        ...(errorObj.code && { code: String(errorObj.code) }),
        ...(errorObj.status && { status: Number(errorObj.status) }),
        ...(errorObj.type && { type: String(errorObj.type) }),
      }
    } catch {
      return { message: String(error) }
    }
  }

  // Handle primitive values
  return { message: String(error) }
}

/**
 * Safely logs any type of error with consistent formatting
 * @param context Description of where the error occurred
 * @param error Any type of error
 */
export function logError(context: string, error: unknown): void {
  console.error(`[ERROR] ${context}:`, String(error))

  // Log additional details if available
  if (error instanceof Error && error.stack) {
    console.error(`[STACK] ${context}:`, error.stack)
  }
}

/**
 * Creates a new error with the original error information preserved
 * @param message New error message
 * @param originalError The original error that was caught
 * @returns A new Error object with combined information
 */
export function createErrorWithCause(message: string, originalError: unknown): Error {
  const newError = new Error(`${message}: ${String(originalError)}`)

  // Preserve the original stack if possible
  if (originalError instanceof Error && originalError.stack) {
    // Append original stack to the new error
    newError.stack = `${newError.stack}\nCaused by: ${originalError.stack}`
  }

  // Add a cause property (supported in newer JS environments)
  ;(newError as any).cause = originalError

  return newError
}

/**
 * Wraps an async function with standardized error handling
 * @param fn The async function to wrap
 * @param errorMessage Optional custom error message prefix
 * @returns A wrapped function with standardized error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorMessage = 'Operation failed'
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw createErrorWithCause(errorMessage, error)
    }
  }
}
