import { prisma } from './db'

export type PropertyFilter = {
  minPrice?: number
  maxPrice?: number
  location?: string
}

export type PaginationOptions = {
  page?: number
  limit?: number
}

/**
 * Get properties with filtering and pagination
 */
export async function getProperties(
  filter: PropertyFilter = {},
  pagination: PaginationOptions = { page: 1, limit: 10 }
) {
  const { minPrice, maxPrice, location } = filter

  const { page = 1, limit = 10 } = pagination

  // Build where clause
  const where: any = {}

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = minPrice
    if (maxPrice) where.price.lte = maxPrice
  }

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit

  // Get properties with pagination
  const properties = await prisma.property.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      price: 'asc',
    },
  })

  // Get total count for pagination
  const total = await prisma.property.count({ where })

  return {
    properties,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
  })
}

/**
 * Get nearby properties based on location
 */
export async function getNearbyProperties(
  propertyId: string,
  distance: number = 10, // distance in kilometers
  limit: number = 5
) {
  // First get the property
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property?.lat || !property?.lng) {
    return []
  }

  const { lat, lng } = property

  // Find properties within the specified distance
  // This is a simplified approach - for production, consider using PostGIS
  // or a more sophisticated geospatial query
  const nearbyProperties = await prisma.property.findMany({
    where: {
      id: { not: propertyId }, // Exclude the current property
      lat: {
        gte: lat - distance * 0.009, // Rough approximation: 1 degree ≈ 111km
        lte: lat + distance * 0.009,
      },
      lng: {
        gte: lng - distance * 0.009,
        lte: lng + distance * 0.009,
      },
    },
    take: limit,
  })

  return nearbyProperties
}
