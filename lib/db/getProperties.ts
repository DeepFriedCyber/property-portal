import { prisma } from '../db'

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