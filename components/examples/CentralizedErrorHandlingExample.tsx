'use client';

import React, { useState } from 'react';
import { useCentralizedErrorHandler } from '@/hooks/useCentralizedErrorHandler';
import { ApiError } from '@/lib/api/error-handling';
import { ValidationError } from '@/lib/api/validation';
import { ErrorType, ErrorSeverity } from '@/lib/error/error-service';

/**
 * Example component that demonstrates the centralized error handling
 */
const CentralizedErrorHandlingExample: React.FC = () => {
  const [count, setCount] = useState(0);
  
  // Use the centralized error handler hook
  const {
    hasError,
    errorMessage,
    errorCode,
    errorDetails,
    isApiError,
    isValidationError,
    errorType,
    errorSeverity,
    handleError,
    resetError,
    withErrorHandling,
    withAsyncErrorHandling
  } = useCentralizedErrorHandler({
    component: 'CentralizedErrorHandlingExample',
    tags: ['example', 'error-handling']
  });
  
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
  const safeThrowError = withErrorHandling(throwError, { 
    action: 'throwRegularError',
    severity: ErrorSeverity.MEDIUM
  });
  
  const safeThrowApiError = withErrorHandling(throwApiError, { 
    action: 'throwApiError',
    severity: ErrorSeverity.HIGH
  });
  
  const safeThrowValidationError = withErrorHandling(throwValidationError, { 
    action: 'throwValidationError',
    severity: ErrorSeverity.LOW
  });
  
  const safeThrowAsyncError = withAsyncErrorHandling(throwAsyncError, { 
    action: 'throwAsyncError',
    severity: ErrorSeverity.CRITICAL
  });
  
  // Safe function that doesn't throw
  const safeIncrement = withErrorHandling(() => {
    setCount(prev => prev + 1);
  }, { action: 'increment' });
  
  // Get the appropriate color for the error severity
  const getSeverityColor = () => {
    switch (errorSeverity) {
      case ErrorSeverity.LOW:
        return 'text-yellow-600';
      case ErrorSeverity.MEDIUM:
        return 'text-orange-600';
      case ErrorSeverity.HIGH:
        return 'text-red-600';
      case ErrorSeverity.CRITICAL:
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Centralized Error Handling Example</h3>
      
      {/* Display error if there is one */}
      {hasError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-red-700">
              {isApiError ? 'API Error' : isValidationError ? 'Validation Error' : 'Error'}
              {errorCode && ` (${errorCode})`}
            </h4>
            
            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor()} bg-opacity-10`}>
              {errorType} - {errorSeverity}
            </span>
          </div>
          
          <p className={`mb-2 ${getSeverityColor()}`}>{errorMessage}</p>
          
          {isValidationError && errorDetails && (
            <div className="mt-2 p-2 bg-white rounded border border-red-100 text-sm">
              <ul className="list-disc pl-5">
                {Object.entries(errorDetails as Record<string, string>).map(([field, message]) => (
                  <li key={field}>
                    <span className="font-semibold">{field}:</span> {message}
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
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Synchronous Errors</h4>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => safeThrowError()}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Throw Regular Error (Medium)
            </button>
            
            <button
              onClick={() => safeThrowApiError()}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Throw API Error (High)
            </button>
            
            <button
              onClick={() => safeThrowValidationError()}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
            >
              Throw Validation Error (Low)
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Asynchronous Errors</h4>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => safeThrowAsyncError()}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              Throw Async Error (Critical)
            </button>
            
            <button
              onClick={() => handleError(new Error('Manually handled error'), {
                action: 'manualError',
                severity: ErrorSeverity.LOW
              })}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Manual Error (Low)
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded">
        <p className="mb-2">
          This example demonstrates the centralized error handling system. All errors are:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Caught and displayed in a consistent way</li>
          <li>Logged with structured metadata (component, action, severity)</li>
          <li>Categorized by type and severity</li>
          <li>Handled without crashing the application</li>
        </ul>
      </div>
    </div>
  );
};

export default CentralizedErrorHandlingExample;