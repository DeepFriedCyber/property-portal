'use client'

import { useEffect } from 'react'

interface ErrorDisplayProps {
  error: Error
  reset: () => void
}

export default function ErrorDisplay({ error, reset }: ErrorDisplayProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-red-50 p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Something went wrong!</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || 'An unexpected error occurred. Please try again later.'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
