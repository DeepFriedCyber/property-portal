export type Property = {
  id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  createdAt: Date
  images: string[]
}

export interface PropertySearchParams {
  location?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
}
