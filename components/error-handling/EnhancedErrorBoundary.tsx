// components/error-handling/EnhancedErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react'

import logger from '@/lib/logging/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  errorTypes?: Array<string>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Enhanced error boundary component that catches render errors
 */
class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error with structured logging
    logger.error(
      'Error caught by boundary',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorName: error.name,
        errorMessage: error.message,
      },
      ['error-boundary', 'render-error']
    )

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback, errorTypes } = this.props

    if (hasError && error) {
      // Check if we should handle this type of error
      if (errorTypes && !errorTypes.includes(error.name)) {
        // Re-throw errors we don't want to handle
        throw error
      }

      // Render custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError)
        }
        return fallback
      }

      // Default error UI
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            Please try again later or contact support if the problem persists.
          </p>
          <div className="mb-4 p-3 bg-white rounded border border-red-100 text-sm text-gray-700 overflow-auto max-h-32">
            <p className="font-semibold">
              {error.name}: {error.message}
            </p>
          </div>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      )
    }

    return children
  }
}

/**
 * Hook to catch and handle async errors
 */
function useAsyncErrorHandler(onError?: (error: Error) => void, errorTypes?: Array<string>) {
  const [asyncError, setAsyncError] = useState<Error | null>(null)

  // Set up global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      // Check if we should handle this type of error
      if (errorTypes && error.name && !errorTypes.includes(error.name)) {
        return
      }

      // Log the error
      logger.error(
        'Unhandled promise rejection',
        error,
        {
          errorName: error.name,
          errorMessage: error.message,
        },
        ['error-boundary', 'async-error', 'unhandled-rejection']
      )

      // Set the error state
      setAsyncError(error)

      // Call the optional onError callback
      if (onError) {
        onError(error)
      }

      // Prevent the default handler
      event.preventDefault()
    }

    // Add event listener
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Clean up
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onError, errorTypes])

  // Reset the error state
  const resetAsyncError = () => {
    setAsyncError(null)
  }

  return { asyncError, resetAsyncError }
}

/**
 * Enhanced error boundary that catches both render errors and async errors
 */
const EnhancedErrorBoundary: React.FC<ErrorBoundaryProps> = props => {
  const { children, fallback, onError, errorTypes } = props

  // Use the async error handler hook
  const { asyncError, resetAsyncError } = useAsyncErrorHandler(error => {
    if (onError) {
      onError(error, { componentStack: '' })
    }
  }, errorTypes)

  // If there's an async error, render the fallback
  if (asyncError) {
    if (fallback) {
      if (typeof fallback === 'function') {
        return <>{fallback(asyncError, resetAsyncError)}</>
      }
      return <>{fallback}</>
    }

    // Default error UI for async errors
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
        <p className="text-red-600 mb-4">
          An error occurred while processing your request. Please try again.
        </p>
        <div className="mb-4 p-3 bg-white rounded border border-red-100 text-sm text-gray-700 overflow-auto max-h-32">
          <p className="font-semibold">
            {asyncError.name}: {asyncError.message}
          </p>
        </div>
        <button
          onClick={resetAsyncError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    )
  }

  // If no async error, use the base error boundary for render errors
  return <ErrorBoundaryBase {...props} />
}

export default EnhancedErrorBoundary
