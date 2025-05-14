// components/error-handling/GlobalErrorHandler.tsx
'use client';

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import logger from '@/lib/logging/logger';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
  sentryDsn?: string;
  logRocketAppId?: string;
  environment?: 'development' | 'test' | 'production';
  release?: string;
}

/**
 * Global error handler component that sets up error tracking and logging
 * This should be placed at the root of the application
 */
const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({
  children,
  sentryDsn,
  logRocketAppId,
  environment = process.env.NODE_ENV as 'development' | 'test' | 'production',
  release = process.env.NEXT_PUBLIC_APP_VERSION
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Configure logger on mount
  useEffect(() => {
    logger.configureLogger({
      minLevel: environment === 'production' ? 'warn' : 'debug',
      enableConsole: true,
      sentryDsn,
      logRocketAppId,
      environment,
      release
    });
    
    // Log application start
    logger.info('Application initialized', {
      environment,
      release,
      pathname,
      searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : {}
    });
    
    // Set up global error handlers
    const handleGlobalError = (
      event: ErrorEvent | PromiseRejectionEvent,
      type: 'error' | 'unhandledrejection'
    ) => {
      const error = type === 'error' 
        ? (event as ErrorEvent).error || new Error((event as ErrorEvent).message)
        : (event as PromiseRejectionEvent).reason;
      
      const message = type === 'error'
        ? 'Uncaught global error'
        : 'Unhandled promise rejection';
      
      // Log the error
      logger.error(
        message,
        error,
        {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          url: window.location.href,
          type
        },
        ['global-error', type]
      );
      
      // Don't prevent default behavior in production to allow Sentry/LogRocket to capture
      if (environment !== 'production') {
        event.preventDefault();
      }
    };
    
    // Add event listeners
    window.addEventListener('error', (event) => handleGlobalError(event, 'error'));
    window.addEventListener('unhandledrejection', (event) => 
      handleGlobalError(event, 'unhandledrejection')
    );
    
    // Clean up
    return () => {
      window.removeEventListener('error', (event) => handleGlobalError(event, 'error'));
      window.removeEventListener('unhandledrejection', (event) => 
        handleGlobalError(event, 'unhandledrejection')
      );
    };
  }, [environment, release, sentryDsn, logRocketAppId, pathname, searchParams]);
  
  // Track route changes
  useEffect(() => {
    logger.debug('Route changed', {
      pathname,
      searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : {}
    });
  }, [pathname, searchParams]);
  
  return <>{children}</>;
};

export default GlobalErrorHandler;