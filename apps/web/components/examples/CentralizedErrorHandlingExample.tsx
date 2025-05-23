'use client'

import React, { useState } from 'react'

import { ApiError } from '@/lib/api/error-handling'
import { ValidationError } from '@/lib/api/validation'
import { error as logError } from '@/lib/logging/logger'

/**
 * Example component demonstrating centralized error handling
 */
const CentralizedErrorHandlingExample: React.FC = () => {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  // Simulate different types of errors
  const simulateGenericError = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        throw new Error('This is a simulated generic error')
      } catch (err) {
        if (err instanceof Error) {
          // Log the error
          logError('Generic error occurred:', err)
          // Set the error state
          setError(err)
        }
        setLoading(false)
      }
    }, 500)
  }

  const simulateApiError = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        throw new ApiError('Failed to fetch user data', 404, 'USER_NOT_FOUND', {
          userId: '12345',
        })
      } catch (err) {
        if (err instanceof Error) {
          // Log the error
          logError('API error occurred:', err)
          // Set the error state
          setError(err)
        }
        setLoading(false)
      }
    }, 500)
  }

  const simulateValidationError = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        throw new ValidationError('Form validation failed', 'VALIDATION_ERROR', {
          email: 'Email is required',
          password: 'Password must be at least 8 characters',
        })
      } catch (err) {
        if (err instanceof Error) {
          // Log the error
          logError('Validation error occurred:', err)
          // Set the error state
          setError(err)
        }
        setLoading(false)
      }
    }, 500)
  }

  // Clear the error
  const clearError = () => {
    setError(null)
  }

  // Render appropriate error UI based on error type
  const renderErrorUI = () => {
    if (!error) return null

    if (error instanceof ApiError) {
      return (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">API Error</h3>
          <p className="text-red-700 mb-2">{error.message}</p>
          <div className="bg-white p-3 rounded mb-3 text-sm font-mono">
            <p>Status: {error.statusCode}</p>
            <p>Code: {error.code}</p>
            {error.details && <p>Details: {JSON.stringify(error.details)}</p>}
          </div>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )
    }

    if (error instanceof ValidationError) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Validation Error</h3>
          <p className="text-yellow-700 mb-3">{error.message}</p>
          {Object.keys(error.fieldErrors).length > 0 && (
            <div className="bg-white p-3 rounded mb-3">
              <h4 className="font-semibold mb-2">Field Errors:</h4>
              <ul className="list-disc pl-5">
                {Object.entries(error.fieldErrors).map(([field, message]) => (
                  <li key={field} className="text-red-600">
                    <span className="font-semibold">{field}:</span> {message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={clearError}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Dismiss
          </button>
        </div>
      )
    }

    // Generic error
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700 mb-3">{error.message}</p>
        <button
          onClick={clearError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <p className="text-gray-600 mb-4">
        This example demonstrates centralized error handling with different error types and
        appropriate UI for each.
      </p>

      {/* Error UI */}
      {renderErrorUI()}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={simulateGenericError}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Simulate Generic Error'}
        </button>

        <button
          onClick={simulateApiError}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Simulate API Error'}
        </button>

        <button
          onClick={simulateValidationError}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Simulate Validation Error'}
        </button>
      </div>
    </div>
  )
}

export default CentralizedErrorHandlingExample
