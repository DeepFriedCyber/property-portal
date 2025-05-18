import { NextRequest, NextResponse } from 'next/server'

import { fetchPropertyById, fetchNearbyProperties } from '@/lib/api'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const includeNearby = request.nextUrl.searchParams.get('nearby') === 'true'

    // Fetch the property
    const result = await fetchPropertyById(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    // If nearby properties are requested and we have coordinates
    let nearbyProperties = []
    if (includeNearby && result.property?.lat && result.property?.lng) {
      nearbyProperties = await fetchNearbyProperties(id, result.property.lat, result.property.lng)
    }

    // Return the property and nearby properties
    return NextResponse.json({
      property: result.property,
      nearbyProperties: includeNearby ? nearbyProperties : undefined,
    })
  } catch (error) {
    console.error(`Error fetching property:`, error)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}
