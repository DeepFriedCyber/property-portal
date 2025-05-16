import { useState, useCallback } from 'react';

import logger from '@/lib/logging/logger';

/**
 * Custom hook for handling errors in components
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  /**
   * Handle an error by logging it and updating state
   */
  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      logger.error('Error caught by useErrorHandler:', err);
      setError(err);
    } else {
      const unknownError = new Error(typeof err === 'string' ? err : 'An unknown error occurred');
      logger.error('Unknown error caught by useErrorHandler:', unknownError);
      setError(unknownError);
    }
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}
