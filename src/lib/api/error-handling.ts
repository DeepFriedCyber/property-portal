/**
 * Centralized API error handling and standardized error responses
 */
import { NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Custom API Error class for standardized error handling
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'APIError'
    // This maintains proper stack trace in modern JS engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError)
    }
  }
}

/**
 * Validation error for handling invalid input data
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, details)
    this.name = 'ValidationError'
  }
}

/**
 * Not found error for handling missing resources
 */
export class NotFoundError extends APIError {
  constructor(message: string) {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

/**
 * Unauthorized error for handling authentication issues
 */
export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Forbidden error for handling permission issues
 */
export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Handle API errors and return standardized response
 * @param error The error to handle
 * @returns NextResponse with appropriate status code and error details
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known API errors
  if (error instanceof APIError) {
    // Log error with appropriate level based on status code
    if (error.statusCode >= 500) {
      logger.error(`API Error [${error.statusCode}]: ${error.message}`, {
        details: error.details,
        stack: error.stack,
      })
    } else if (error.statusCode >= 400) {
      logger.warn(`API Error [${error.statusCode}]: ${error.message}`, {
        details: error.details,
      })
    }

    // Return standardized error response
    return NextResponse.json(
      {
        error: {
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle unexpected errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  const stack = error instanceof Error ? error.stack : undefined

  // Log unexpected errors as critical
  logger.error('Unexpected API Error:', {
    message,
    stack,
    error,
  })

  // Return generic error for unexpected errors
  return NextResponse.json(
    {
      error: {
        message: 'Internal Server Error',
      },
    },
    { status: 500 }
  )
}

/**
 * Wrap an API handler with error handling
 * @param handler The API handler function to wrap
 * @returns A wrapped handler with error handling
 */
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}