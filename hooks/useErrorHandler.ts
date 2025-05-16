// hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';

import { ApiError } from '@/lib/api/error-handling';
import { ValidationError } from '@/lib/api/validation';
import logger from '@/lib/logging/logger';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
  errorCode?: string;
  errorDetails?: any;
  isApiError: boolean;
  isValidationError: boolean;
}

interface UseErrorHandlerOptions {
  logErrors?: boolean;
  rethrow?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling errors in React components
 * @param options Error handler options
 * @returns Error state and handler functions
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { logErrors = true, rethrow = false, onError } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: '',
    errorCode: undefined,
    errorDetails: undefined,
    isApiError: false,
    isValidationError: false,
  });

  /**
   * Handle an error
   * @param error Error to handle
   * @param context Additional context for logging
   * @param tags Tags for categorizing logs
   */
  const handleError = useCallback(
    (error: unknown, context?: Record<string, any>, tags?: string[]) => {
      // Convert to Error object if needed
      const errorObject =
        error instanceof Error
          ? error
          : new Error(typeof error === 'string' ? error : 'Unknown error');

      // Determine error type
      const isApiError = errorObject instanceof ApiError;
      const isValidationError = errorObject instanceof ValidationError;

      // Get error details
      const errorMessage = errorObject.message;
      const errorCode = isApiError
        ? (errorObject as ApiError).code
        : isValidationError
          ? (errorObject as ValidationError).code
          : undefined;
      const errorDetails = isApiError
        ? (errorObject as ApiError).details
        : isValidationError
          ? (errorObject as ValidationError).details
          : undefined;

      // Update error state
      setErrorState({
        hasError: true,
        error: errorObject,
        errorMessage,
        errorCode,
        errorDetails,
        isApiError,
        isValidationError,
      });

      // Log the error
      if (logErrors) {
        logger.error(
          'Error caught by useErrorHandler',
          errorObject,
          {
            ...context,
            isApiError,
            isValidationError,
            errorCode,
            errorDetails,
          },
          [...(tags || []), 'error-handler']
        );
      }

      // Call the optional onError callback
      if (onError) {
        onError(errorObject);
      }

      // Rethrow the error if requested
      if (rethrow) {
        throw errorObject;
      }
    },
    [logErrors, rethrow, onError]
  );

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
    });
  }, []);

  /**
   * Create a try/catch wrapper for a function
   * @param fn Function to wrap
   * @param context Additional context for logging
   * @param tags Tags for categorizing logs
   * @returns Wrapped function
   */
  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => R, context?: Record<string, any>, tags?: string[]) => {
      return (...args: T): R | undefined => {
        try {
          return fn(...args);
        } catch (error) {
          handleError(error, context, tags);
          return undefined;
        }
      };
    },
    [handleError]
  );

  /**
   * Create a try/catch wrapper for an async function
   * @param fn Async function to wrap
   * @param context Additional context for logging
   * @param tags Tags for categorizing logs
   * @returns Wrapped async function
   */
  const withAsyncErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      context?: Record<string, any>,
      tags?: string[]
    ) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error, context, tags);
          return undefined;
        }
      };
    },
    [handleError]
  );

  return {
    ...errorState,
    handleError,
    resetError,
    withErrorHandling,
    withAsyncErrorHandling,
  };
}
