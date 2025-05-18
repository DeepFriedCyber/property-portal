import { NextRequest, NextResponse } from 'next/server'

import { fetchProperties } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')

    // Fetch properties with the given parameters
    const result = await fetchProperties(query, page, limit)

    // Return the properties and pagination info
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in properties API route:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}
