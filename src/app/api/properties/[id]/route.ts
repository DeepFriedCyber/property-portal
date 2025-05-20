import { NextRequest, NextResponse } from 'next/server'

import { fetchPropertyById, fetchNearbyProperties } from '@/lib/api'
import { Property } from '@/types/property'

import { withErrorHandling, NotFoundError } from '@/lib/api/error-handling'
import { logger } from '@/lib/api/logger'

/**
 * GET /api/properties/[id]
 * Fetch a single property by ID with optional nearby properties
 */
export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const id = params.id
    const includeNearby = request.nextUrl.searchParams.get('nearby') === 'true'

    logger.info(`Fetching property with ID: ${id}`, { includeNearby })

    // Fetch the property
    const result = await fetchPropertyById(id)

    if (result.error) {
      logger.warn(`Property not found: ${id}`)
      throw new NotFoundError(result.error)
    }

    // If nearby properties are requested and we have coordinates
    let nearbyProperties: Property[] = []
    if (includeNearby && result.property?.lat && result.property?.lng) {
      logger.info(`Fetching nearby properties for ${id}`, {
        lat: result.property.lat,
        lng: result.property.lng,
      })

      nearbyProperties = await fetchNearbyProperties(id, result.property.lat, result.property.lng)

      logger.info(`Found ${nearbyProperties.length} nearby properties`)
    }

    // Return the property and nearby properties
    return NextResponse.json({
      property: result.property,
      nearbyProperties: includeNearby ? nearbyProperties : undefined,
    })
  }
)
