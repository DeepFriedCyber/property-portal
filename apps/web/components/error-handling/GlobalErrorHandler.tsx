// components/error-handling/GlobalErrorHandler.tsx
'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import LogRocket from 'logrocket';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
  sentryDsn?: string;
  logRocketAppId?: string;
  environment: 'development' | 'test' | 'production';
  release?: string;
}

/**
 * Global error handler component that initializes error tracking services
 */
const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({
  children,
  sentryDsn,
  logRocketAppId,
  environment,
  release
}) => {
  useEffect(() => {
    // Initialize Sentry if DSN is provided
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment,
        release,
        tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
        replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
      });
    }

    // Initialize LogRocket if app ID is provided
    if (logRocketAppId) {
      LogRocket.init(logRocketAppId, {
        release,
        console: {
          isEnabled: {
            error: true,
            warn: environment !== 'production',
            log: false,
          },
        },
      });

      // Integrate LogRocket with Sentry if both are available
      if (sentryDsn) {
        LogRocket.getSessionURL(sessionURL => {
          Sentry.withScope(scope => {
            scope.setExtra('logRocketSessionURL', sessionURL);
          });
        });
      }
    }

    // Set up global error handler
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // Call the original handler if it exists
      if (originalOnError) {
        originalOnError(message, source, lineno, colno, error);
      }

      // Custom error handling logic here
      console.error('Global error caught:', { message, source, lineno, colno, error });

      return false; // Let the default handler run
    };

    // Set up unhandled promise rejection handler
    const originalOnUnhandledRejection = window.onunhandledrejection;
    
    // Using addEventListener instead of direct assignment to avoid 'this' context issues
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      // Call the original handler if it exists
      if (typeof originalOnUnhandledRejection === 'function') {
        // The original handler is already bound to the correct context
        originalOnUnhandledRejection(event);
      }

      // Custom rejection handling logic here
      console.error('Unhandled promise rejection:', event.reason);

      // We can't return false here as addEventListener doesn't support it
      // Use preventDefault() if you want to prevent the default behavior
      // event.preventDefault();
    });

    // Cleanup function
    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
    };
  }, [sentryDsn, logRocketAppId, environment, release]);

  return <>{children}</>;
};

export default GlobalErrorHandler;