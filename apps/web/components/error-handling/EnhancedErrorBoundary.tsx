// components/error-handling/EnhancedErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo } from 'react';

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode | ((error: Error, resetError: () => void) => React.ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced error boundary component with customizable fallback UI and error handling
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Render the fallback UI
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      return fallback;
    }

    return children;
  }
}

export default EnhancedErrorBoundary;