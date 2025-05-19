/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * The project has migrated to Clerk for authentication.
 *
 * Please use Clerk's authentication components and APIs instead:
 * - For UI components: import { SignIn, SignUp, UserButton } from '@clerk/nextjs'
 * - For auth helpers: import { auth, currentUser } from '@clerk/nextjs'
 * - For middleware: import { authMiddleware } from '@clerk/nextjs'
 */

import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return a message indicating that this endpoint is deprecated
  return res.status(410).json({
    error: 'This API endpoint is deprecated. The application now uses Clerk for authentication.',
    message: 'Please use Clerk authentication instead of NextAuth.js',
  })
}
