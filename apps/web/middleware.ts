import { NextRequest, NextResponse } from 'next/server'

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

export default function middleware(request: NextRequest) {
  // Check if we're in development mode and should bypass auth
  const isDevelopmentMode = process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT_MODE === 'true'

  // If in development mode, allow all requests
  if (isDevelopmentMode) {
    return NextResponse.next()
  }

  // Check if the route is public
  const isPublic = publicRoutes.some(
    route => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  )

  // If it's a public route, allow access
  if (isPublic) {
    return NextResponse.next()
  }

  // For protected routes, redirect to sign-in if not authenticated
  // In a real implementation, you would check for auth token here
  const signInUrl = new URL('/sign-in', request.url)
  signInUrl.searchParams.set('redirect_url', request.url)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
