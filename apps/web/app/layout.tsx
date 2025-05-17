import React from 'react'

import './globals.css'
import GlobalErrorHandler from '@/components/error-handling/GlobalErrorHandler'
import RouteErrorBoundary from '@/components/error-handling/RouteErrorBoundary'
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
  title: {
    template: '%s | Property Portal',
    default: 'Property Portal | Find Your Dream Home',
  },
  description: 'Discover thousands of properties for sale and rent across the UK. Find your perfect home with our easy-to-use search tools.',
  keywords: 'property, real estate, homes for sale, houses for rent, UK property market',
  openGraph: {
    title: 'Property Portal | Find Your Dream Home',
    description: 'Discover thousands of properties for sale and rent across the UK.',
    images: [
      {
        url: 'https://property-portal.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Property Portal',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property Portal | Find Your Dream Home',
    description: 'Discover thousands of properties for sale and rent across the UK.',
    images: ['https://property-portal.com/twitter-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if we're in development mode and should bypass Clerk
  const isDevelopmentMode = process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT_MODE === 'true'

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
  )

  // If in development mode, return content without ClerkProvider
  if (isDevelopmentMode) {
    return content
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
  )
}
