import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Placeholder search API
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  // Mock search results
  const mockResults = [
    {
      id: '1',
      address: '123 Main St, Anytown, USA',
      price: 350000,
      bedrooms: 3,
      type: 'House',
    },
    {
      id: '2',
      address: '456 Oak Ave, Somewhere, USA',
      price: 275000,
      bedrooms: 2,
      type: 'Apartment',
    },
  ]

  return NextResponse.json({
    success: true,
    data: {
      query,
      results: mockResults,
    },
  })
}
