import { prisma } from '../db'
import { PaginationOptions } from './getProperties'

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
    }
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