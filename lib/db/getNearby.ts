import { prisma } from '../db'

/**
 * Get nearby properties based on location
 */
export async function getNearbyProperties(
  propertyId: string,
  distance: number = 10, // distance in kilometers
  limit: number = 5
) {
  // First get the property
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property?.lat || !property?.lng) {
    return []
  }

  const { lat, lng } = property

  // Find properties within the specified distance
  // This is a simplified approach - for production, consider using PostGIS
  // or a more sophisticated geospatial query
  const nearbyProperties = await prisma.property.findMany({
    where: {
      id: { not: propertyId }, // Exclude the current property
      lat: {
        gte: lat - distance * 0.009, // Rough approximation: 1 degree ≈ 111km
        lte: lat + distance * 0.009,
      },
      lng: {
        gte: lng - distance * 0.009,
        lte: lng + distance * 0.009,
      },
    },
    take: limit,
  })

  return nearbyProperties
}