import { Property } from '@/types/property'
import { getProperties, getProperty } from '@/app/actions/properties'

/**
 * Fetch properties with optional filtering
 * This is a wrapper around the server action to provide a cleaner API
 */
export async function fetchProperties(options?: {
  listingType?: 'sale' | 'rent'
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  propertyType?: string
  location?: string
  limit?: number
  offset?: number
}) {
  const result = await getProperties({
    listingType: options?.listingType,
    minPrice: options?.minPrice,
    maxPrice: options?.maxPrice,
    bedrooms: options?.bedrooms,
    propertyType: options?.propertyType,
    location: options?.location,
    limit: options?.limit || 10,
    offset: options?.offset || 0,
  })

  if (!result.success) {
    return {
      properties: [] as Property[],
      totalCount: 0,
      error: result.error?.message || 'Failed to fetch properties',
    }
  }

  return {
    properties: result.data.properties,
    totalCount: result.data.totalCount,
    error: undefined,
  }
}

/**
 * Fetch a single property by ID
 * This is a wrapper around the server action to provide a cleaner API
 */
export async function fetchPropertyById(id: string) {
  const result = await getProperty(id)

  if (!result.success) {
    return {
      property: undefined,
      error: result.error?.message || 'Failed to fetch property',
    }
  }

  return {
    property: result.data,
    error: undefined,
  }
}