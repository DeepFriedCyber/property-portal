<<<<<<< HEAD
import { Prisma } from '@prisma/client'

import { Property } from '@/types/property'

import { logger } from './api/logger'
=======
import { Property } from '@/types/property'

>>>>>>> clean-branch
import { prisma } from './db'

/**
 * Fetch properties with optional filtering
 * @param query - Search query for property title or location
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @param filters - Optional filters for properties (minPrice, maxPrice, bedrooms, propertyType, listingType)
 * @returns Promise with properties and total count
 */
export async function fetchProperties(
  query = '',
  page = 1,
  limit = 6,
  filters?: {
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    propertyType?: string
    listingType?: 'sale' | 'rent'
  }
): Promise<{
  properties: Property[]
  totalCount: number
  error?: string
}> {
  try {
    const skip = (page - 1) * limit

    // Build the where clause for both queries
    const where: Prisma.PropertyWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ],
    }

    // Add filters if provided
    if (filters) {
      // Initialize price filter object
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        // Create a new price object
        const priceFilter: Prisma.FloatFilter = {}

        if (filters.minPrice !== undefined) {
          priceFilter.gte = filters.minPrice
        }

        if (filters.maxPrice !== undefined) {
          priceFilter.lte = filters.maxPrice
        }

        where.price = priceFilter
      }

      if (filters.bedrooms !== undefined) {
        where.bedrooms = filters.bedrooms
      }

      // Handle property type and listing type filters
      if (filters.propertyType) {
        where.propertyType = filters.propertyType
      }

      if (filters.listingType) {
        where.listingType = filters.listingType
      }
    }

    // Get properties with pagination
    const dbProperties = await prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        address: true,
        city: true,
        location: true,
        postcode: true,
        councilTaxBand: true,
        tenure: true,
        epcRating: true,
        metadata: true,
        lat: true,
        lng: true,
        images: true,
      },
    })

    // Get total count for pagination
    const totalCount = await prisma.property.count({ where })

    // Map database properties to the Property type
    const properties: Property[] = dbProperties.filter(Boolean).map(prop => ({
      id: prop.id || '',
      title: prop.title || '',
      description: prop.description || undefined,
      price: prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      squareFeet: prop.area || 0, // Map area to squareFeet
      address: prop.address || undefined,
      city: prop.city || '', // Ensure city is always provided
      location: prop.location || '',
      postcode: prop.postcode || undefined,
      councilTaxBand: prop.councilTaxBand || undefined,
      tenure: prop.tenure || undefined,
      epcRating: prop.epcRating || undefined,
      metadata: (prop.metadata as any) || undefined,
      lat: prop.lat || 0,
      lng: prop.lng || 0,
      imageUrl: prop.images && prop.images.length > 0 ? prop.images[0] : undefined,
    }))

    logger.debug(`Found ${properties.length} properties matching query "${query}"`, {
      totalCount,
      page,
      limit,
      filters,
    })

    return {
      properties,
      totalCount,
    }
  } catch (error) {
    logger.error('Error fetching properties:', { error, query, page, limit })
    return {
      properties: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
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
    const dbProperty = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        address: true,
        city: true,
        location: true,
        postcode: true,
        councilTaxBand: true,
        tenure: true,
        epcRating: true,
        metadata: true,
        lat: true,
        lng: true,
        images: true,
      },
    })

    if (!dbProperty) {
      logger.warn(`Property not found: ${id}`)
      return {
        error: `Property with ID ${id} not found`,
      }
    }

    // Map database property to the Property type
    const property: Property = {
      id: dbProperty.id || '',
      title: dbProperty.title || '',
      description: dbProperty.description || undefined,
      price: dbProperty.price || 0,
      bedrooms: dbProperty.bedrooms || 0,
      bathrooms: dbProperty.bathrooms || 0,
      squareFeet: dbProperty.area || 0, // Map area to squareFeet
      address: dbProperty.address || undefined,
      city: dbProperty.city || '', // Ensure city is always provided
      location: dbProperty.location || '',
      postcode: dbProperty.postcode || undefined,
      councilTaxBand: dbProperty.councilTaxBand || undefined,
      tenure: dbProperty.tenure || undefined,
      epcRating: dbProperty.epcRating || undefined,
      metadata: (dbProperty.metadata as any) || undefined,
      lat: dbProperty.lat || 0,
      lng: dbProperty.lng || 0,
      imageUrl:
        dbProperty.images && dbProperty.images.length > 0 ? dbProperty.images[0] : undefined,
    }

    logger.debug(`Found property: ${id}`, {
      title: property.title,
      location: property.location,
    })

    return {
      property,
    }
  } catch (error) {
    logger.error(`Error fetching property ${id}:`, { error })
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
  try {
    // Calculate the approximate latitude/longitude range
    // 1 degree of latitude is approximately 111 kilometers
    const latRange = distance / 111

    // Longitude degrees vary based on latitude (narrower at higher latitudes)
    // cos(latitude in radians) gives the ratio of longitude degree length to latitude degree length
    const lngRange = latRange / Math.cos(lat * (Math.PI / 180))

    const dbProperties = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        lat: {
          gte: lat - latRange,
          lte: lat + latRange,
        },
        lng: {
          gte: lng - lngRange,
          lte: lng + lngRange,
        },
      },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        address: true,
        city: true,
        location: true,
        postcode: true,
        councilTaxBand: true,
        tenure: true,
        epcRating: true,
        metadata: true,
        lat: true,
        lng: true,
        images: true,
      },
    })

    // Map database properties to the Property type
    const properties: Property[] = dbProperties.filter(Boolean).map(prop => ({
      id: prop.id || '',
      title: prop.title || '',
      description: prop.description || undefined,
      price: prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      squareFeet: prop.area || 0, // Map area to squareFeet
      address: prop.address || undefined,
      city: prop.city || '', // Ensure city is always provided
      location: prop.location || '',
      postcode: prop.postcode || undefined,
      councilTaxBand: prop.councilTaxBand || undefined,
      tenure: prop.tenure || undefined,
      epcRating: prop.epcRating || undefined,
      metadata: (prop.metadata as any) || undefined,
      lat: prop.lat || 0,
      lng: prop.lng || 0,
      imageUrl: prop.images && prop.images.length > 0 ? prop.images[0] : undefined,
    }))

    logger.debug(`Found ${properties.length} nearby properties for ${propertyId}`, {
      lat,
      lng,
      distance,
      limit,
    })

    return properties
  } catch (error) {
    logger.error(`Error fetching nearby properties for ${propertyId}:`, {
      error,
      lat,
      lng,
      distance,
      limit,
    })
    return []
  }
}
