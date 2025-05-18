// hooks/useCentralizedErrorHandler.ts
import { usePathname } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'

import { ApiError } from '@/lib/api/error-handling'
import { ValidationError } from '@/lib/api/validation'
import { errorService, ErrorContext, ErrorType, ErrorSeverity } from '@/lib/error/error-service'

interface ErrorState {
  hasError: boolean
  error: Error | null
  errorMessage: string
  errorCode?: string
  errorDetails?: Record<string, unknown>
  isApiError: boolean
  isValidationError: boolean
  errorType: ErrorType
  errorSeverity: ErrorSeverity
}

interface UseCentralizedErrorHandlerOptions {
  component?: string
  action?: string
  tags?: string[]
  onError?: (error: Error, context: ErrorContext) => void
}

/**
 * Hook for handling errors using the centralized error service
 * @param options Error handler options
 * @returns Error state and handler functions
 */
export function useCentralizedErrorHandler(options: UseCentralizedErrorHandlerOptions = {}) {
  const { component, action, tags, onError } = options
  const pathname = usePathname()

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: '',
    errorCode: undefined,
    errorDetails: undefined,
    isApiError: false,
    isValidationError: false,
    errorType: ErrorType.UNKNOWN,
    errorSeverity: ErrorSeverity.LOW,
  })

  // Create a default context for all errors
  const defaultContext = {
    component,
    action,
    tags,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    pathname,
  }

  /**
   * Handle an error
   * @param error Error to handle
   * @param additionalContext Additional context for the error
   */
  const handleError = useCallback(
    (error: unknown, additionalContext?: Omit<ErrorContext, 'type' | 'severity'>) => {
      // Convert to Error object if needed
      const errorObject =
        error instanceof Error
          ? error
          : new Error(typeof error === 'string' ? error : 'Unknown error')

      // Determine error type and details
      const isApiError = errorObject instanceof ApiError
      const isValidationError = errorObject instanceof ValidationError
      const errorType = isApiError
        ? ErrorType.API
        : isValidationError
          ? ErrorType.VALIDATION
          : ErrorType.UNKNOWN

      // Get error details
      const errorMessage = errorObject.message
      const errorCode = isApiError
        ? (errorObject as ApiError).code
        : isValidationError
          ? (errorObject as ValidationError).code
          : undefined
      const errorDetails = isApiError
        ? (errorObject as ApiError).details
        : isValidationError
          ? (errorObject as ValidationError).details
          : undefined

      // Create context for the error service
      const context: ErrorContext = {
        ...defaultContext,
        ...additionalContext,
        type: errorType,
        metadata: {
          ...(additionalContext?.metadata || {}),
          errorCode,
          errorDetails,
        },
      }

      // Update error state
      setErrorState({
        hasError: true,
        error: errorObject,
        errorMessage,
        errorCode,
        errorDetails,
        isApiError,
        isValidationError,
        errorType,
        errorSeverity: context.severity || ErrorSeverity.LOW,
      })

      // Handle the error with the error service
      errorService.handleError(errorObject, context)

      // Call the optional onError callback
      if (onError) {
        onError(errorObject, context)
      }
    },
    [defaultContext, onError]
  )

  /**
   * Reset the error state
   */
  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: '',
      errorCode: undefined,
      errorDetails: undefined,
      isApiError: false,
      isValidationError: false,
      errorType: ErrorType.UNKNOWN,
      errorSeverity: ErrorSeverity.LOW,
    })
  }, [])

  /**
   * Create a try/catch wrapper for a function
   * @param fn Function to wrap
   * @param additionalContext Additional context for errors
   * @returns Wrapped function
   */
  const withErrorHandling = useCallback(
    <T extends Array<unknown>, R>(
      fn: (...args: T) => R,
      additionalContext?: Omit<ErrorContext, 'type' | 'severity'>
    ) => {
      return (...args: T): R | undefined => {
        try {
          return fn(...args)
        } catch (error) {
          handleError(error, additionalContext)
          return undefined
        }
      }
    },
    [handleError]
  )

  /**
   * Create a try/catch wrapper for an async function
   * @param fn Async function to wrap
   * @param additionalContext Additional context for errors
   * @returns Wrapped async function
   */
  const withAsyncErrorHandling = useCallback(
    <T extends Array<unknown>, R>(
      fn: (...args: T) => Promise<R>,
      additionalContext?: Omit<ErrorContext, 'type' | 'severity'>
    ) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          return await fn(...args)
        } catch (error) {
          handleError(error, additionalContext)
          return undefined
        }
      }
    },
    [handleError]
  )

  // Reset error state when component or pathname changes
  useEffect(() => {
    resetError()
  }, [component, pathname, resetError])

  return {
    ...errorState,
    handleError,
    resetError,
    withErrorHandling,
    withAsyncErrorHandling,
  }
}
