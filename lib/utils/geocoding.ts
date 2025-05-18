/**
 * Geocoding utilities for converting postcodes to coordinates
 */

/**
 * Lookup a UK postcode and return its latitude and longitude
 *
 * @param postcode - UK format postcode (e.g., "SW1A 1AA")
 * @returns Promise resolving to {lat, lng} coordinates
 * @throws Error if the postcode cannot be found or API request fails
 */
export async function lookupPostcode(postcode: string): Promise<{ lat: number; lng: number }> {
  if (!postcode || !process.env.MAPTILER_API_KEY) {
    throw new Error(
      !postcode ? 'Postcode is required' : 'MAPTILER_API_KEY environment variable is not set'
    )
  }

  // Format the postcode (remove spaces, convert to uppercase)
  const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase()

  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
    formattedPostcode
  )}.json?key=${process.env.MAPTILER_API_KEY}&country=gb`

  try {
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`MapTiler API returned ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    if (!json.features || json.features.length === 0) {
      throw new Error(`No location found for postcode: ${postcode}`)
    }

    const [lng, lat] = json.features[0].center
    return { lat, lng }
  } catch (error) {
    console.error('Error looking up postcode:', error)
    throw new Error(
      `Failed to lookup postcode: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Validate if a string is a valid UK postcode format
 *
 * @param postcode - String to validate
 * @returns boolean indicating if the postcode is valid format
 */
export function isValidUKPostcode(postcode: string): boolean {
  // UK postcode regex pattern
  const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i
  return postcodePattern.test(postcode)
}
