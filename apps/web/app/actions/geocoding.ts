'use server'

import { lookupPostcode } from '@/lib/utils/geocoding'

/**
 * Server action to lookup a UK postcode and return coordinates
 *
 * @param postcode - UK format postcode
 * @returns Object containing lat/lng coordinates or error message
 */
export async function getPostcodeCoordinates(postcode: string): Promise<{
  success: boolean
  data?: { lat: number; lng: number }
  error?: string
}> {
  try {
    if (!postcode) {
      return {
        success: false,
        error: 'Postcode is required',
      }
    }

    const coordinates = await lookupPostcode(postcode)

    return {
      success: true,
      data: coordinates,
    }
  } catch (error) {
    console.error('Error in getPostcodeCoordinates:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to lookup postcode',
    }
  }
}
