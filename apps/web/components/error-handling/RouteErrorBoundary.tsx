// components/error-handling/RouteErrorBoundary.tsx
'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import logger from '@/lib/logging/logger'

import EnhancedErrorBoundary from './EnhancedErrorBoundary'

interface RouteErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error, resetError: () => void) => React.ReactNode)
  onError?: (error: Error) => void
}

/**
 * Error boundary specifically for handling route errors
 */
const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children, fallback, onError }) => {
  const router = useRouter()

  // Default fallback UI for route errors
  const defaultFallback = (error: Error, resetError: () => void) => {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Navigation Error</h2>

        <p className="text-blue-600 mb-4">
          There was a problem loading this page. Please try again or go back to the home page.
        </p>

        <div className="mb-4 p-3 bg-white rounded border border-blue-100 text-sm text-gray-700 overflow-auto max-h-32">
          <p className="font-semibold">
            {error.name}: {error.message}
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Handle route errors
  const handleError = (error: Error) => {
    // Log the error
    logger.error(
      'Route error caught by boundary',
      error,
      {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
      ['error-boundary', 'route-error']
    )

    // Call the optional onError callback
    if (onError) {
      onError(error)
    }
  }

  return (
    <EnhancedErrorBoundary fallback={fallback || defaultFallback} onError={handleError}>
      {children}
    </EnhancedErrorBoundary>
  )
}

export default RouteErrorBoundary
