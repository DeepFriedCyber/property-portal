'use client';

import React, { useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ApiError } from '@/lib/api/error-handling';
import { ValidationError } from '@/lib/api/validation';

/**
 * Example component that demonstrates the useErrorHandler hook
 */
const ErrorHandlingHookExample: React.FC = () => {
  const [count, setCount] = useState(0);
  
  // Use the error handler hook
  const {
    hasError,
    errorMessage,
    errorCode,
    errorDetails,
    isApiError,
    isValidationError,
    handleError,
    resetError,
    withErrorHandling,
    withAsyncErrorHandling
  } = useErrorHandler();
  
  // Function that throws a regular error
  const throwError = () => {
    throw new Error('This is a regular error');
  };
  
  // Function that throws an API error
  const throwApiError = () => {
    throw new ApiError(
      'This is an API error',
      500,
      'API_ERROR',
      { details: 'Some API error details' }
    );
  };
  
  // Function that throws a validation error
  const throwValidationError = () => {
    throw new ValidationError(
      'This is a validation error',
      'VALIDATION_ERROR',
      {
        name: 'Name is required',
        email: 'Email is invalid'
      }
    );
  };
  
  // Async function that throws an error
  const throwAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('This is an async error');
  };
  
  // Safe versions of the error-throwing functions
  const safeThrowError = withErrorHandling(throwError, { source: 'regular' });
  const safeThrowApiError = withErrorHandling(throwApiError, { source: 'api' });
  const safeThrowValidationError = withErrorHandling(throwValidationError, { source: 'validation' });
  const safeThrowAsyncError = withAsyncErrorHandling(throwAsyncError, { source: 'async' });
  
  // Safe function that doesn't throw
  const safeIncrement = withErrorHandling(() => {
    setCount(prev => prev + 1);
  });
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Error Handling Hook Example</h3>
      
      {/* Display error if there is one */}
      {hasError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-700 mb-2">
            {isApiError ? 'API Error' : isValidationError ? 'Validation Error' : 'Error'}
            {errorCode && ` (${errorCode})`}
          </h4>
          
          <p className="text-red-600 mb-2">{errorMessage}</p>
          
          {isValidationError && errorDetails && (
            <div className="mt-2 p-2 bg-white rounded border border-red-100 text-sm">
              <ul className="list-disc pl-5">
                {Object.entries(errorDetails).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-semibold">{field}:</span> {message as string}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={resetError}
            className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Clear Error
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Current count: <span className="font-semibold">{count}</span>
        </p>
        
        <button
          onClick={safeIncrement}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 mr-2"
        >
          Safe Increment
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => safeThrowError()}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Throw Regular Error
        </button>
        
        <button
          onClick={() => safeThrowApiError()}
          className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
        >
          Throw API Error
        </button>
        
        <button
          onClick={() => safeThrowValidationError()}
          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
        >
          Throw Validation Error
        </button>
        
        <button
          onClick={() => safeThrowAsyncError()}
          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
        >
          Throw Async Error
        </button>
        
        <button
          onClick={() => handleError(new Error('Manually handled error'))}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          Manual Error
        </button>
      </div>
    </div>
  );
};

export default ErrorHandlingHookExample;