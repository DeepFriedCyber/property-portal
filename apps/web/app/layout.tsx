import React from 'react';

import './globals.css';
import GlobalErrorHandler from '@/components/error-handling/GlobalErrorHandler';
import RouteErrorBoundary from '@/components/error-handling/RouteErrorBoundary';
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Property Portal',
  description: 'A modern property listing and management portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if we're in development mode and should bypass Clerk
  const isDevelopmentMode = process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT_MODE === 'true';
  
  // Wrap the content with ClerkProvider only if not in development mode
  const content = (
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
  );

  // If in development mode, return content without ClerkProvider
  if (isDevelopmentMode) {
    return content;
  }

  // Otherwise, wrap with ClerkProvider
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'rounded-lg shadow-md',
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
