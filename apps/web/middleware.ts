import { authMiddleware, redirectToSignIn } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/search',
  '/api/search',
  '/api/status',
  '/standalone',
  '/simple-test',
  '/test-page',
]

export default authMiddleware({
  // Define the public routes that don't require authentication
  publicRoutes,

  // Optional: Define routes that should be ignored by the middleware
  ignoredRoutes: ['/(api|trpc)(.*)', '/_next/static/(.*)', '/favicon.ico'],

  // Custom logic for handling authentication
  afterAuth(auth, req) {
    // Check if we're in development mode and should bypass auth
    const isDevelopmentMode = process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT_MODE === 'true'

    // If in development mode, allow all requests
    if (isDevelopmentMode) {
      return NextResponse.next()
    }

    // Check if the route is public
    const isPublic = publicRoutes.some(
      route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
    )

    // If it's a public route, allow access
    if (isPublic) {
      return NextResponse.next()
    }

    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !isPublic) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
