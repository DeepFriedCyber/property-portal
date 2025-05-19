import { prisma } from './db'

export type PropertyFilter = {
  minPrice?: number
  maxPrice?: number
  location?: string
  councilTaxBand?: string
  epcRating?: string
  tenure?: string
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
  // Validate and sanitize numeric inputs
  const minPrice = filter.minPrice && filter.minPrice > 0 ? filter.minPrice : undefined
  const maxPrice = filter.maxPrice && filter.maxPrice > 0 ? filter.maxPrice : undefined
  const { location, councilTaxBand, epcRating, tenure } = filter

  // Validate pagination parameters
  let page = pagination.page || 1
  let limit = pagination.limit || 10

  // Ensure page and limit are positive integers
  page = Math.max(1, Math.floor(page))
  limit = Math.max(1, Math.min(100, Math.floor(limit))) // Cap at 100 items per page

  // Build where clause
  const where: {
    price?: {
      gte?: number
      lte?: number
    }
    location?: {
      contains: string
      mode: 'insensitive'
    }
    councilTaxBand?: string
    epcRating?: string
    tenure?: string
  } = {}

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

  // Add new filters
  if (councilTaxBand) {
    where.councilTaxBand = councilTaxBand
  }

  if (epcRating) {
    where.epcRating = epcRating
  }

  if (tenure) {
    where.tenure = tenure
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

  // Calculate total pages
  const totalPages = Math.ceil(total / limit)

  return {
    properties,
    pagination: {
      total,
      page,
      limit,
      pages: totalPages,
      totalPages, // Added for frontend UX (alias for 'pages')
    },
  }
}

/**
 * Get a single property by ID
 * @param id The property ID to look up
 * @returns The property object or null if not found
 * @throws Error if the ID format is invalid
 */
export async function getPropertyById(id: string) {
  // Validate ID format (assuming UUID format)
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid property ID provided')
  }

  // Find the property
  const property = await prisma.property.findUnique({
    where: { id },
  })

  // Explicitly return null for not found case
  return property
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

/**
 * Get user's favorite properties
 * @param userId The user ID to get favorites for
 * @param pagination Optional pagination parameters
 * @returns Array of property objects that the user has favorited
 */
export async function getUserFavorites(
  userId: string,
  pagination: PaginationOptions = { page: 1, limit: 20 }
) {
  // Validate pagination parameters
  let page = pagination.page || 1
  let limit = pagination.limit || 20

  // Ensure page and limit are positive integers
  page = Math.max(1, Math.floor(page))
  limit = Math.max(1, Math.min(100, Math.floor(limit)))

  // Calculate skip for pagination
  const skip = (page - 1) * limit

  // Get favorites with pagination and ordering
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: 'desc', // Most recently favorited first
    },
    skip,
    take: limit,
  })

  // Get total count for pagination info
  const total = await prisma.favorite.count({ where: { userId } })

  // Calculate total pages
  const totalPages = Math.ceil(total / limit)

  return {
    properties: favorites.map(favorite => favorite.property),
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  }
}

/**
 * Add a property to user's favorites
 * @param userId The user ID
 * @param propertyId The property ID to favorite
 * @returns Object with success status and favorite data
 */
export async function addToFavorites(userId: string, propertyId: string) {
  try {
    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        propertyId,
      },
    })

    if (existing) {
      // Already favorited - return consistent response
      return {
        success: true,
        favorite: existing,
        isNew: false,
      }
    }

    // Add to favorites
    const newFavorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    })

    // Return consistent response
    return {
      success: true,
      favorite: newFavorite,
      isNew: true,
    }
  } catch (error) {
    // Return consistent error response
    return {
      success: false,
      error: 'Failed to add favorite',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Remove a property from user's favorites
 * @param userId The user ID
 * @param propertyId The property ID to unfavorite
 * @returns Object with success status and removal information
 */
export async function removeFromFavorites(userId: string, propertyId: string) {
  try {
    // Remove from favorites
    const result = await prisma.favorite.deleteMany({
      where: {
        userId,
        propertyId,
      },
    })

    // Return consistent response
    return {
      success: true,
      removed: result.count > 0,
      count: result.count,
    }
  } catch (error) {
    // Return consistent error response
    return {
      success: false,
      error: 'Failed to remove favorite',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
