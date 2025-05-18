const MAPTILER_KEY = process.env.MAPTILER_API_KEY!

/**
 * Interface for MapTiler API feature properties
 */
interface MapTilerFeatureProperties {
  category: string
  address: string
  [key: string]: unknown // For any other properties that might be present
}

/**
 * Interface for MapTiler API feature
 */
interface MapTilerFeature {
  text: string
  properties: MapTilerFeatureProperties
  [key: string]: unknown // For any other properties that might be present
}

/**
 * Interface for MapTiler API response
 */
interface MapTilerResponse {
  features: MapTilerFeature[]
  [key: string]: unknown // For any other properties that might be present
}

/**
 * Interface for amenity data returned to clients
 */
export interface Amenity {
  name: string
  category: string
  address: string
}

/**
 * Fetches nearby points of interest (amenities) using MapTiler Places API
 * @param lat Latitude of the location
 * @param lng Longitude of the location
 * @returns Array of nearby amenities with name, category, and address
 */
export async function fetchNearbyAmenities(lat: number, lng: number): Promise<Amenity[]> {
  const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}&types=poi&limit=5`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`MapTiler API error: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as MapTilerResponse

  return json.features.map((f: MapTilerFeature) => ({
    name: f.text,
    category: f.properties.category,
    address: f.properties.address,
  }))
}
