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
  metadata?: {
    mainImageUrl?: string
    title?: string
  }
  lat: number
  lng: number
}
