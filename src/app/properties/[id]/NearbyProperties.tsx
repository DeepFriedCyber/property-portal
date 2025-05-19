import PropertyCard from '@/components/PropertyCard'
import { fetchNearbyProperties } from '@/lib/api'

interface NearbyPropertiesProps {
  propertyId: string
  lat: number
  lng: number
  radius?: number
  limit?: number
}

export default async function NearbyProperties({
  propertyId,
  lat,
  lng,
  radius = 20, // 20km radius by default
  limit = 3, // 3 properties by default
}: NearbyPropertiesProps) {
  // Fetch nearby properties
  const nearbyProperties = await fetchNearbyProperties(propertyId, lat, lng, radius, limit)

  // If no nearby properties, don't render anything
  if (!nearbyProperties || nearbyProperties.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Nearby Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {nearbyProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
