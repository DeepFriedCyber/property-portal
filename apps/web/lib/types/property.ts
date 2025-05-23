/**
 * Property-related type definitions
 */

/**
 * Property interface representing a real estate property
 */
export interface Property {
  id: string
  uploadId?: string
  title?: string
  address?: string
  location?: string // Combined location (e.g., "Cambridge, UK")
  city?: string
  state?: string
  zipCode?: string
  postcode?: string // UK-specific postal code
  country?: string
  price?: number | string // Allow both number and formatted string (e.g., "£350,000")
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  area?: string // Formatted area (e.g., "850 sq ft")
  description?: string
  features?: string[]
  status?: 'available' | 'pending' | 'sold' | 'deleted'
  imageUrl?: string // Single image URL
  
  // UK-specific fields
  councilTaxBand?: string // A–H
  tenure?: string // Freehold / Leasehold
  epcRating?: string // A–G

  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  images?: PropertyImage[]
<<<<<<< Updated upstream
  metadata?: Record<string, unknown>
=======
  metadata?: Record<string, unknown> // Use unknown instead of any
>>>>>>> Stashed changes
}

/**
 * Property image interface
 */
export interface PropertyImage {
  id: string
  propertyId: string
  url: string
  caption?: string
  isPrimary?: boolean
  order?: number
  createdAt: string
}

/**
 * Input for creating a new property
 */
export type CreatePropertyInput = Omit<Property, 'id' | 'createdAt' | 'images'> & {
  images?: Omit<PropertyImage, 'id' | 'propertyId' | 'createdAt'>[]
}

/**
 * Input for updating an existing property
 */
export type UpdatePropertyInput = Partial<
  Omit<Property, 'id' | 'createdAt' | 'createdBy' | 'images'>
> & {
  images?: Omit<PropertyImage, 'id' | 'propertyId' | 'createdAt'>[]
}

/**
 * Property search filters
 */
export interface PropertySearchFilters {
  city?: string
  state?: string
  zipCode?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  minSquareFeet?: number
  status?: Property['status']
  createdAfter?: string
  createdBefore?: string
}

/**
 * Property search result
 */
export interface PropertySearchResult {
  properties: Property[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
