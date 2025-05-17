export interface Property {
  id: string
  title: string
  description: string
  price: number
  type: string
  status: string
  bedrooms: number
  bathrooms: number
  squareFeet: number
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  features: string[]
  createdAt: string
  updatedAt?: string
  metadata: {
    mainImageUrl?: string
    listingType?: 'rent' | 'sale'
    receptionRooms?: number
    epcRating?: string
    tenure?: string
    councilTaxBand?: string
    addressLine2?: string
    title?: string
  }
}