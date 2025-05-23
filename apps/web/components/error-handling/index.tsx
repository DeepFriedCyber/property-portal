'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

import { ApiError } from '@/lib/api/error-handling'
import { ValidationError } from '@/lib/api/validation'
import { error as logError } from '@/lib/logging/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Base error boundary component that catches errors in its child component tree
 */
class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our monitoring service
    logError('Error caught by error boundary:', error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      errorMessage: error.message,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-700 mb-3">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Specialized error boundary for API errors
 */
class ApiErrorBoundary extends EnhancedErrorBoundary {
  render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error
      const isApiError = error instanceof ApiError
      const statusCode = isApiError ? (error as ApiError).statusCode : 500
      const errorCode = isApiError ? (error as ApiError).code : 'UNKNOWN_ERROR'
      const details = isApiError ? (error as ApiError).details : undefined

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">API Error</h3>
          <p className="text-red-700 mb-2">{error?.message || 'Failed to fetch data'}</p>

          <div className="bg-white p-3 rounded mb-3 text-sm font-mono">
            <p>Status: {statusCode}</p>
            <p>Code: {errorCode}</p>
            {details && <p>Details: {JSON.stringify(details)}</p>}
          </div>

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Specialized error boundary for form validation errors
 */
class FormErrorBoundary extends EnhancedErrorBoundary {
  render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error
      const isValidationError = error instanceof ValidationError
      const fieldErrors = isValidationError ? (error as ValidationError).fieldErrors : {}

      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Validation Error</h3>
          <p className="text-yellow-700 mb-3">{error?.message || 'Form validation failed'}</p>

          {Object.keys(fieldErrors).length > 0 && (
            <div className="bg-white p-3 rounded mb-3">
              <h4 className="font-semibold mb-2">Field Errors:</h4>
              <ul className="list-disc pl-5">
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <li key={field} className="text-red-600">
                    <span className="font-semibold">{field}:</span> {message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Fix and retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export { EnhancedErrorBoundary, ApiErrorBoundary, FormErrorBoundary }
