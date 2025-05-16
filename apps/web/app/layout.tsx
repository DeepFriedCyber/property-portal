import React from 'react';

import './globals.css';
import GlobalErrorHandler from '@/components/error-handling/GlobalErrorHandler';
import RouteErrorBoundary from '@/components/error-handling/RouteErrorBoundary';
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor';
import { EnhancedClerkProvider } from '@/lib/auth/clerk-wrapper';

export const metadata = {
  title: 'Property Portal',
  description: 'A modern property listing and management portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'rounded-lg shadow-md',
        },
      }}
    >
      <html lang="en">
        <body className="min-h-screen bg-gray-50">
          <GlobalErrorHandler
            sentryDsn={process.env.NEXT_PUBLIC_SENTRY_DSN}
            logRocketAppId={process.env.NEXT_PUBLIC_LOGROCKET_APP_ID}
            environment={process.env.NODE_ENV as 'development' | 'test' | 'production'}
            release={process.env.NEXT_PUBLIC_APP_VERSION}
          >
            <PerformanceMonitor>
              <RouteErrorBoundary>{children}</RouteErrorBoundary>
            </PerformanceMonitor>
          </GlobalErrorHandler>
        </body>
      </html>
    </EnhancedClerkProvider>
  );
}
