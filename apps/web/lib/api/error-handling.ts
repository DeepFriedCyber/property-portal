/**
 * Custom API error class for handling API-specific errors
 */
export class ApiError extends Error {
  statusCode: number
  code: string
  details?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

/**
 * Handle API errors in a consistent way
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(error.message)
  }

  return new ApiError('An unknown error occurred')
}

/**
 * Format API errors for consistent response structure
 */
export function formatApiError(error: unknown): {
  error: {
    message: string
    code: string
    statusCode: number
    details?: Record<string, unknown>
  }
} {
  const apiError = handleApiError(error)

  return {
    error: {
      message: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
      details: apiError.details,
    },
  }
}
