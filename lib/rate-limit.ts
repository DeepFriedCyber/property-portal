import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  // Maximum number of requests allowed within the interval
  limit: number
  // Time window in seconds
  interval: number
  // Optional identifier function to determine the rate limit key (defaults to IP address)
  identifierFn?: (req: NextRequest) => string
}

// In-memory store for rate limiting
// In production, you should use Redis or another distributed cache
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Rate limiting middleware for Next.js API routes
 */
export function rateLimit(config: RateLimitConfig) {
  const { limit, interval, identifierFn } = config

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Get identifier (default to IP address)
    const identifier = identifierFn
      ? identifierFn(req)
      : headers().get('x-forwarded-for') || 'unknown-ip'

    const now = Date.now()
    const windowKey = `${identifier}`

    // Get or initialize rate limit data for this identifier
    const rateData = rateLimitStore.get(windowKey) || {
      count: 0,
      resetTime: now + interval * 1000,
    }

    // If the reset time has passed, reset the counter
    if (rateData.resetTime < now) {
      rateData.count = 0
      rateData.resetTime = now + interval * 1000
    }

    // Increment request count
    rateData.count += 1
    rateLimitStore.set(windowKey, rateData)

    // Set rate limit headers
    const headers = new Headers()
    headers.set('X-RateLimit-Limit', limit.toString())
    headers.set('X-RateLimit-Remaining', Math.max(0, limit - rateData.count).toString())
    headers.set('X-RateLimit-Reset', Math.ceil(rateData.resetTime / 1000).toString())

    // If over limit, return 429 Too Many Requests
    if (rateData.count > limit) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers,
        }
      )
    }

    return null // Continue to the API handler
  }
}

/**
 * Apply rate limiting to a Next.js API route handler
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  config: RateLimitConfig
) {
  const rateLimiter = rateLimit(config)

  return async (req: NextRequest) => {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiter(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Continue to the handler if rate limit not exceeded
    return handler(req)
  }
}
