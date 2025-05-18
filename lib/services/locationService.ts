/**
 * Location Service
 *
 * Provides geocoding and location search functionality for UK addresses and postcodes
 * using the MapTiler Geocoding API.
 */

/**
 * Interface for location search results
 */
export interface LocationResult {
  label: string
  lat: number
  lng: number
}

/**
 * Autocomplete UK locations and postcodes
 *
 * @param query The search query (partial postcode, place name, etc.)
 * @returns Array of matching locations with coordinates
 */
export async function autocompleteUKLocation(query: string): Promise<LocationResult[]> {
  // Validate input
  if (!query || query.trim().length === 0) {
    return []
  }

  const MAPTILER_KEY = process.env.MAPTILER_API_KEY!

  // Validate API key
  if (!MAPTILER_KEY) {
    throw new Error('MAPTILER_API_KEY environment variable is not set')
  }

  try {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      query
    )}.json?key=${MAPTILER_KEY}&country=gb&language=en&limit=5`

    const res = await fetch(url)

    // Handle API errors
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(`MapTiler API error: ${res.status} ${errorData?.message || res.statusText}`)
    }

    const json = await res.json()

    // Transform the response to our simplified format
    return json.features.map((f: any) => ({
      label: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
    }))
  } catch (error) {
    console.error('Error in autocompleteUKLocation:', error)
    throw error
  }
}

/**
 * Get detailed information about a specific UK postcode
 *
 * @param postcode The full UK postcode
 * @returns Detailed location information
 */
export async function getPostcodeDetails(postcode: string): Promise<LocationResult | null> {
  const MAPTILER_KEY = process.env.MAPTILER_API_KEY!

  if (!MAPTILER_KEY) {
    throw new Error('MAPTILER_API_KEY environment variable is not set')
  }

  try {
    // Format the postcode by removing spaces and converting to uppercase
    const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase()

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      formattedPostcode
    )}.json?key=${MAPTILER_KEY}&country=gb&language=en&limit=1`

    const res = await fetch(url)

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      throw new Error(`MapTiler API error: ${res.status} ${errorData?.message || res.statusText}`)
    }

    const json = await res.json()

    // If no results found, return null
    if (!json.features || json.features.length === 0) {
      return null
    }

    const feature = json.features[0]

    return {
      label: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
    }
  } catch (error) {
    console.error('Error in getPostcodeDetails:', error)
    throw error
  }
}
