import { Property } from '@/types/property'

import { prisma } from './db'

/**
 * Fetch properties with optional filtering
 * @param query - Search query for property title or location
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @returns Promise with properties and total count
 */
export async function fetchProperties(
  query = '',
  page = 1,
  limit = 6
): Promise<{
  properties: Property[]
  totalCount: number
}> {
  const skip = (page - 1) * limit

  // Build the where clause for both queries
  const where = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { location: { contains: query, mode: 'insensitive' } },
    ],
  }

  // Get properties with pagination
  const properties = await prisma.property.findMany({
    where,
    skip,
    take: limit,
    orderBy: { title: 'asc' },
  })

  // Get total count for pagination
  const totalCount = await prisma.property.count({ where })

  return {
    properties,
    totalCount,
  }
}

/**
 * Fetch a single property by ID
 * @param id - Property ID
 * @returns Promise with property data
 */
export async function fetchPropertyById(id: string): Promise<{
  property?: Property
  error?: string
}> {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return {
        error: `Property with ID ${id} not found`,
      }
    }

    return {
      property,
    }
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error)
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Fetch nearby properties based on coordinates
 * @param propertyId - ID of the current property to exclude
 * @param lat - Latitude
 * @param lng - Longitude
 * @param distance - Distance in kilometers
 * @param limit - Maximum number of properties to return
 * @returns Promise with nearby properties
 */
export async function fetchNearbyProperties(
  propertyId: string,
  lat: number,
  lng: number,
  distance: number = 10,
  limit: number = 3
): Promise<Property[]> {
  // Calculate the approximate latitude/longitude range
  // 1 degree of latitude is approximately 111 kilometers
  const latRange = distance / 111

  const properties = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      lat: {
        gte: lat - latRange,
        lte: lat + latRange,
      },
      lng: {
        gte: lng - latRange,
        lte: lng + latRange,
      },
    },
    take: limit,
  })

  return properties
}
