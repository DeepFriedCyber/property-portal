// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { withRateLimit } from '../../../lib/rate-limit'
import { semanticSearch } from '../../../lib/search'

/**
 * Handler for semantic search API
 */
async function handler(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: 'Invalid query',
          message: 'Search query must be at least 2 characters long',
        },
        { status: 400 }
      )
    }

    const results = await semanticSearch(query)

    // Add cache control headers for better performance
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=60') // Cache for 1 minute

    return NextResponse.json(results, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error processing search:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to process search query',
      },
      { status: 500 }
    )
  }
}

// Apply rate limiting: 20 requests per minute
export const POST = withRateLimit(handler, {
  limit: 20,
  interval: 60, // 60 seconds
})
