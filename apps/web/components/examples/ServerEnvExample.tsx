// This is a Server Component
import { env } from '@/src/env.mjs';

export default function ServerEnvExample() {
  // We can safely access server-side environment variables here
  const databaseConfigured = !!env.DATABASE_URL;
  const authSecretConfigured = !!env.NEXTAUTH_SECRET;
  const clerkSecretConfigured = !!env.CLERK_SECRET_KEY;
  
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Server Environment Variables</h2>
      <p>The following server environment variables are configured:</p>
      <ul className="list-disc ml-5 mt-2">
        <li>DATABASE_URL {databaseConfigured ? '✅' : '❌'}</li>
        <li>NEXTAUTH_SECRET {authSecretConfigured ? '✅' : '❌'}</li>
        <li>CLERK_SECRET_KEY {clerkSecretConfigured ? '✅' : '❌'}</li>
      </ul>
      <p className="text-sm text-gray-500 mt-2">
        Note: This is a server component. Server-side environment variables are only accessible in 
        Server Components or API routes.
      </p>
    </div>
  );
}