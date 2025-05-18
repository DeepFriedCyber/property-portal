// ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo)

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Return custom fallback UI if provided, otherwise default error message
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>Please try again later or contact support if the problem persists.</p>
          <button onClick={() => this.setState({ hasError: false })} className="retry-button">
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
