// lib/getListings.ts
/**
 * Functions for fetching property listings
 */

// Define the Property interface
export interface Property {
  id: string
  title: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  description?: string
  images: string[]
  features: string[]
  embedding?: number[] // Vector embedding for semantic search
  score?: number // Similarity score for search results
}

/**
 * Get all property listings
 * @returns Promise resolving to array of properties
 */
export async function getAllListings(): Promise<Property[]> {
  try {
    // In a real application, this would fetch from an API or database
    // For now, we'll return mock data
    return mockListings
  } catch (error) {
    console.error('Error fetching listings:', error)
    return []
  }
}

/**
 * Get a single property by ID
 * @param id Property ID
 * @returns Promise resolving to property or null if not found
 */
export async function getListingById(id: string): Promise<Property | null> {
  try {
    const listings = await getAllListings()
    return listings.find(listing => listing.id === id) || null
  } catch (error) {
    console.error('Error fetching listing:', error)
    return null
  }
}

// Mock data for development
const mockListings: Property[] = [
  {
    id: '1',
    title: 'Modern 3-bedroom apartment in city center',
    location: 'Manchester, UK',
    price: 350000,
    bedrooms: 3,
    bathrooms: 2,
    description:
      'A beautiful modern apartment in the heart of Manchester. Recently renovated with high-end finishes.',
    images: ['/images/property1.jpg'],
    features: ['Parking', 'Garden', 'Gym'],
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5], // This would be a much longer vector in reality
  },
  {
    id: '2',
    title: 'Charming cottage in rural setting',
    location: 'Yorkshire Dales, UK',
    price: 275000,
    bedrooms: 2,
    bathrooms: 1,
    description:
      'A picturesque cottage with stunning views of the Yorkshire Dales. Perfect for those seeking tranquility.',
    images: ['/images/property2.jpg'],
    features: ['Fireplace', 'Garden', 'Original features'],
    embedding: [0.2, 0.3, 0.4, 0.5, 0.6],
  },
  {
    id: '3',
    title: 'Luxury penthouse with panoramic views',
    location: 'London, UK',
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    description:
      'Stunning penthouse apartment with floor-to-ceiling windows offering panoramic views of London skyline.',
    images: ['/images/property3.jpg'],
    features: ['Terrace', 'Concierge', 'Gym', 'Parking'],
    embedding: [0.3, 0.4, 0.5, 0.6, 0.7],
  },
  {
    id: '4',
    title: 'Family home with large garden',
    location: 'Birmingham, UK',
    price: 450000,
    bedrooms: 4,
    bathrooms: 2,
    description:
      'Spacious family home in a quiet neighborhood with a large garden and modern amenities.',
    images: ['/images/property4.jpg'],
    features: ['Garden', 'Garage', 'Conservatory'],
    embedding: [0.4, 0.5, 0.6, 0.7, 0.8],
  },
  {
    id: '5',
    title: 'Studio apartment near university',
    location: 'Leeds, UK',
    price: 120000,
    bedrooms: 1,
    bathrooms: 1,
    description:
      'Compact studio apartment ideal for students or young professionals, located near Leeds University.',
    images: ['/images/property5.jpg'],
    features: ['Furnished', 'Security system'],
    embedding: [0.5, 0.6, 0.7, 0.8, 0.9],
  },
]
