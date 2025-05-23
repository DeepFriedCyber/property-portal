'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect } from 'react';

import logger from '@/lib/logging/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our logging service
    logger.error('Unhandled global error', error, {
      digest: error.digest,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Something went wrong!</h1>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">
                    We're sorry, but something unexpected happened.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Our team has been notified and is working to fix the issue.
                  </p>
                  
                  {error.digest && (
                    <p className="text-sm text-gray-500 mb-4">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={reset}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try again
                  </button>
                  
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}