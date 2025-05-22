'use client'

import React, { useEffect } from 'react'

import logger from '@/lib/logging/logger'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error page for Next.js
 * This is used when an error occurs in a route segment
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  // Log the error when it occurs
  useEffect(() => {
    logger.error(
      'Next.js route error',
      error,
      {
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
      ['next-error', 'route-error']
    )
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Something went wrong!</h2>
        </div>

        <p className="text-gray-600 mb-6">
          We&apos;re sorry, but there was an error loading this page. Our team has been notified and is
          working to fix the issue.
        </p>

        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-6 p-3 bg-gray-100 rounded text-sm text-gray-700 overflow-auto max-h-48">
            <p className="font-semibold">
              {error.name}: {error.message}
            </p>
            {error.stack && <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>}
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>

          <a
            href="/"
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  )
}
