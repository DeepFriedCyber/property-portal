// components/error-handling/ApiErrorBoundary.tsx
'use client';

import React from 'react';

import EnhancedErrorBoundary from './EnhancedErrorBoundary';

import { ApiError } from '@/lib/api/error-handling';
import logger from '@/lib/logging/logger';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, resetError: () => void) => React.ReactNode);
  onError?: (error: Error) => void;
  retryable?: boolean;
}

/**
 * Error boundary specifically for handling API errors
 */
const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  retryable = true,
}) => {
  // Default fallback UI for API errors
  const defaultFallback = (error: Error, resetError: () => void) => {
    const isApiError = error instanceof ApiError;
    const status = isApiError ? (error as ApiError).status : 500;
    const code = isApiError ? (error as ApiError).code : 'UNKNOWN_ERROR';

    // Determine if the error is retryable
    const canRetry =
      retryable && (!isApiError || (status !== 401 && status !== 403 && status !== 404));

    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          {status === 404 ? 'Not Found' : 'API Error'}
        </h2>

        <p className="text-red-600 mb-4">
          {isApiError
            ? error.message
            : 'There was a problem communicating with the server. Please try again later.'}
        </p>

        {isApiError && code && <p className="text-sm text-red-500 mb-4">Error code: {code}</p>}

        {canRetry && (
          <button
            onClick={resetError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try again
          </button>
        )}
      </div>
    );
  };

  // Handle API errors
  const handleError = (error: Error) => {
    // Log the error
    logger.error(
      'API error caught by boundary',
      error,
      {
        isApiError: error instanceof ApiError,
        status: error instanceof ApiError ? (error as ApiError).status : undefined,
        code: error instanceof ApiError ? (error as ApiError).code : undefined,
        details: error instanceof ApiError ? (error as ApiError).details : undefined,
      },
      ['error-boundary', 'api-error']
    );

    // Call the optional onError callback
    if (onError) {
      onError(error);
    }
  };

  return (
    <EnhancedErrorBoundary
      fallback={fallback || defaultFallback}
      onError={handleError}
      errorTypes={['ApiError', 'NetworkError', 'FetchError']}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default ApiErrorBoundary;
