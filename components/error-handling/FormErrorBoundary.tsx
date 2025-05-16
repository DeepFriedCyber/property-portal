// components/error-handling/FormErrorBoundary.tsx
'use client';

import React from 'react';

import EnhancedErrorBoundary from './EnhancedErrorBoundary';

import { ValidationError } from '@/lib/api/validation';
import logger from '@/lib/logging/logger';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, resetError: () => void) => React.ReactNode);
  onError?: (error: Error) => void;
}

/**
 * Error boundary specifically for handling form validation errors
 */
const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ children, fallback, onError }) => {
  // Default fallback UI for form errors
  const defaultFallback = (error: Error, resetError: () => void) => {
    const isValidationError = error instanceof ValidationError;
    const details = isValidationError ? (error as ValidationError).details : null;

    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Form Validation Error</h2>

        <p className="text-yellow-600 mb-4">{error.message}</p>

        {isValidationError && details && (
          <div className="mb-4 p-3 bg-white rounded border border-yellow-100 text-sm text-gray-700 overflow-auto max-h-48">
            <ul className="list-disc pl-5">
              {Object.entries(details).map(([field, message]) => (
                <li key={field}>
                  <span className="font-semibold">{field}:</span> {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={resetError}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  };

  // Handle form errors
  const handleError = (error: Error) => {
    // Log the error
    logger.error(
      'Form error caught by boundary',
      error,
      {
        isValidationError: error instanceof ValidationError,
        code: error instanceof ValidationError ? (error as ValidationError).code : undefined,
        details: error instanceof ValidationError ? (error as ValidationError).details : undefined,
      },
      ['error-boundary', 'form-error']
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
      errorTypes={['ValidationError', 'FormError']}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default FormErrorBoundary;
