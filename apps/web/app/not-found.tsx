import Link from 'next/link';
import React from 'react';

/**
 * Custom 404 page for Next.js
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Page Not Found</h2>

        <p className="mt-4 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
