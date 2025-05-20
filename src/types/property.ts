/**
 * Base property interface
 */
export interface Property {
  id: string
  title: string
  description?: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  address?: string
  city: string
  location: string
  postcode?: string
  imageUrl?: string
  councilTaxBand?: string
  tenure?: string
  epcRating?: string
  metadata?: {
    mainImageUrl?: string
    title?: string
  }
  lat: number
  lng: number
  embedding?: number[] // Vector embedding for similarity search
}

/**
 * Property result from similarity search API
 * Extends the base property type with a similarity score
 */
export type PropertySimilarityResult = Omit<Property, 'embedding'> & {
  similarity: number
  images?: string[]
  features?: string[]
  area?: number
  createdAt: string | Date
  updatedAt: string | Date
}

/**
 * Response type for the similar properties API
 */
export type SimilarPropertiesResponse = {
  properties: PropertySimilarityResult[]
}
