'use client'

import React, { useState } from 'react'

import { useErrorHandler } from '@/hooks/useErrorHandler'

/**
 * Example component demonstrating the use of an error handling hook
 */
const ErrorHandlingHookExample: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()

  // Simulate a successful API call
  const handleSuccess = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      clearError()
      alert('Operation completed successfully!')
    }, 1000)
  }

  // Simulate a failed API call
  const handleFailure = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      handleError(new Error('Failed to complete the operation'))
    }, 1000)
  }

  // Simulate a network error
  const handleNetworkError = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      handleError(new Error('Network error: Unable to connect to the server'))
    }, 1000)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <p className="text-gray-600 mb-4">
        This example demonstrates using a custom hook for error handling in async operations.
      </p>

      {/* Error display */}
      {error && (
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
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSuccess}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Simulate Success'}
        </button>

        <button
          onClick={handleFailure}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Simulate Error'}
        </button>

        <button
          onClick={handleNetworkError}
          disabled={loading}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Simulate Network Error'}
        </button>
      </div>
    </div>
  )
}

export default ErrorHandlingHookExample
