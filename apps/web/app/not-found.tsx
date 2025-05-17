'use client';

import GitHubPagesLink from '@/components/common/GitHubPagesLink';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Custom 404 page for Next.js with GitHub Pages support
 */
export default function NotFoundPage() {
  const router = useRouter();
  const pathname = usePathname();

  // For GitHub Pages, handle client-side routing
  useEffect(() => {
    // Check if we're on GitHub Pages
    const isGitHubPages = typeof window !== 'undefined' && 
      window.location.hostname.includes('github.io');
    
    if (isGitHubPages) {
      // Strip the basePath for routing
      const path = pathname.replace('/property-portal', '');
      
      // If path exists in our app, navigate to it
      if (path && path !== pathname) {
        router.push(path);
      }
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Page Not Found</h2>

        <p className="mt-4 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8">
          <GitHubPagesLink
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Home
          </GitHubPagesLink>
        </div>
      </div>
    </div>
  );
}
