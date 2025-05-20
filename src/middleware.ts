import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { logger } from '@/lib/api'

/**
 * Middleware for handling API requests
 * - Logs all API requests
 * - Adds request ID for tracking
 * - Handles CORS for API routes
 */
export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Generate a unique request ID
  const requestId = crypto.randomUUID()

  // Log the API request
  logger.info(`API Request: ${request.method} ${request.nextUrl.pathname}`, {
    requestId,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  })

  // Create a response object that we'll manipulate
  const response = NextResponse.next()

  // Add request ID header for tracking
  response.headers.set('X-Request-ID', requestId)

  // Handle CORS for API routes
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Add CORS headers to all API responses
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

/**
 * Configure which paths this middleware runs on
 */
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
}
