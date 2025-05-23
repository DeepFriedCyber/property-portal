'use client'

import { env } from '@/src/env.mjs'

export function MapApiKeyExample() {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Environment Variable Example</h2>
      <p>Clerk Publishable Key is configured: {env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅' : '❌'}</p>
      <p>App URL: {env.NEXT_PUBLIC_APP_URL}</p>
      <p className="text-sm text-gray-500 mt-2">
        Note: This is a client-side environment variable. The actual key is not displayed for
        security reasons.
      </p>
    </div>
  )
}

// This component would be used server-side only
export function DatabaseConfigExample() {
  // In a real component, this would be in a Server Component or API route
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Server Environment Variables</h2>
      <p>The following server environment variables are configured:</p>
      <ul className="list-disc ml-5 mt-2">
        <li>DATABASE_URL ✅</li>
        <li>NEXTAUTH_SECRET ✅</li>
        <li>REDIS_URL {process.env.REDIS_URL ? '✅' : '⚠️ (optional)'}</li>
      </ul>
      <p className="text-sm text-gray-500 mt-2">
        Note: This is for illustration only. In a real app, you would use these in server components
        or API routes.
      </p>
    </div>
  )
}
