'use client'

import React, { useState } from 'react'

import {
  EnhancedErrorBoundary,
  ApiErrorBoundary,
  FormErrorBoundary,
} from '@/components/error-handling'
import CentralizedErrorHandlingExample from '@/components/examples/CentralizedErrorHandlingExample'
import ErrorHandlingHookExample from '@/components/examples/ErrorHandlingHookExample'
import { ApiError } from '@/lib/api/error-handling'
import { ValidationError } from '@/lib/api/validation'
import {
  debug as logDebug,
  info as logInfo,
  warn as logWarn,
  error as logError,
} from '@/lib/logging/logger'

// Component that throws a render error
const RenderErrorComponent = () => {
  // This will throw an error when rendered
  if (true) {
    throw new Error('This is a simulated render error')
  }

  return <div>This will never render</div>
}

// Component that throws an async error
const AsyncErrorComponent = () => {
  const [hasError, setHasError] = useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      // Simulate an async error
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!hasError) {
        setHasError(true)
        throw new Error('This is a simulated async error')
      }
    }

    fetchData()
  }, [hasError])

  return <div>Loading data...</div>
}

// Component that throws an API error
const ApiErrorComponent = () => {
  const [hasError, setHasError] = useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      // Simulate an API error
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!hasError) {
        setHasError(true)
        throw new ApiError('Failed to fetch data from API', 500, 'API_ERROR', {
          details: 'This is a simulated API error',
        })
      }
    }

    fetchData()
  }, [hasError])

  return <div>Loading API data...</div>
}

// Component that throws a validation error
const ValidationErrorComponent = () => {
  const [hasError, setHasError] = useState(false)

  React.useEffect(() => {
    const validateForm = async () => {
      // Simulate a validation error
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!hasError) {
        setHasError(true)
        throw new ValidationError('Form validation failed', 'VALIDATION_ERROR', {
          name: 'Name is required',
          email: 'Email is invalid',
          password: 'Password must be at least 8 characters',
        })
      }
    }

    validateForm()
  }, [hasError])

  return <div>Validating form...</div>
}

// Component that logs errors
const LoggingExample = () => {
  const [logCount, setLogCount] = useState(0)

  const handleLogDebug = () => {
    logDebug('This is a debug message', { count: logCount })
    setLogCount(prev => prev + 1)
  }

  const handleLogInfo = () => {
    logInfo('This is an info message', { count: logCount })
    setLogCount(prev => prev + 1)
  }

  const handleLogWarn = () => {
    logWarn('This is a warning message', { count: logCount })
    setLogCount(prev => prev + 1)
  }

  const handleLogError = () => {
    logError('This is an error message', new Error('Test error'), { count: logCount }, [
      'test',
      'error',
    ])
    setLogCount(prev => prev + 1)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Structured Logging Example</h3>
      <p className="text-gray-600 mb-4">
        Click the buttons below to log messages with different severity levels. Check the browser
        console to see the structured logs.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleLogDebug}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Log Debug
        </button>

        <button
          onClick={handleLogInfo}
          className="px-4 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
        >
          Log Info
        </button>

        <button
          onClick={handleLogWarn}
          className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
        >
          Log Warning
        </button>

        <button
          onClick={handleLogError}
          className="px-4 py-2 bg-red-200 text-red-800 rounded hover:bg-red-300"
        >
          Log Error
        </button>
      </div>
    </div>
  )
}

/**
 * Error handling example page
 */
export default function ErrorHandlingPage() {
  const [showRenderError, setShowRenderError] = useState(false)
  const [showAsyncError, setShowAsyncError] = useState(false)
  const [showApiError, setShowApiError] = useState(false)
  const [showValidationError, setShowValidationError] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Handling Examples</h1>
        <p className="text-gray-600">
          This page demonstrates different types of error handling with error boundaries and
          structured logging.
        </p>
      </div>

      {/* Centralized error handling example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Centralized Error Handling</h2>
        <CentralizedErrorHandlingExample />
      </div>

      {/* Error handling hook example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Error Handling Hook</h2>
        <ErrorHandlingHookExample />
      </div>

      {/* Logging example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Structured Logging</h2>
        <LoggingExample />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Render error example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Render Error</h2>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">
              This example shows how to handle errors that occur during rendering.
            </p>

            <button
              onClick={() => setShowRenderError(prev => !prev)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              {showRenderError ? 'Hide' : 'Show'} Render Error
            </button>

            {showRenderError && (
              <EnhancedErrorBoundary>
                <RenderErrorComponent />
              </EnhancedErrorBoundary>
            )}
          </div>
        </div>

        {/* Async error example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Async Error</h2>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">
              This example shows how to handle errors that occur in async operations.
            </p>

            <button
              onClick={() => setShowAsyncError(prev => !prev)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              {showAsyncError ? 'Hide' : 'Show'} Async Error
            </button>

            {showAsyncError && (
              <EnhancedErrorBoundary>
                <AsyncErrorComponent />
              </EnhancedErrorBoundary>
            )}
          </div>
        </div>

        {/* API error example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">API Error</h2>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">
              This example shows how to handle API errors with a specialized boundary.
            </p>

            <button
              onClick={() => setShowApiError(prev => !prev)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              {showApiError ? 'Hide' : 'Show'} API Error
            </button>

            {showApiError && (
              <ApiErrorBoundary>
                <ApiErrorComponent />
              </ApiErrorBoundary>
            )}
          </div>
        </div>

        {/* Validation error example */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Validation Error</h2>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4">
              This example shows how to handle form validation errors.
            </p>

            <button
              onClick={() => setShowValidationError(prev => !prev)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-4"
            >
              {showValidationError ? 'Hide' : 'Show'} Validation Error
            </button>

            {showValidationError && (
              <FormErrorBoundary>
                <ValidationErrorComponent />
              </FormErrorBoundary>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Notes:</h2>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>All errors are caught by error boundaries and won&apos;t crash the entire app</li>
          <li>Each error type has a specialized error boundary with appropriate UI</li>
          <li>All errors are logged with structured metadata for easier debugging</li>
          <li>The global error handler catches any uncaught errors</li>
          <li>Check the browser console to see the structured logs</li>
        </ul>
      </div>
    </div>
  )
}
