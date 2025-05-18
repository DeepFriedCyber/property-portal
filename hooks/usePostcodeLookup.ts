import { useState } from 'react'

import { getPostcodeCoordinates } from '@/app/actions/geocoding'
import { isValidUKPostcode } from '@/lib/utils/geocoding'

interface PostcodeLookupState {
  loading: boolean
  error: string | null
  coordinates: { lat: number; lng: number } | null
}

interface PostcodeLookupResult extends PostcodeLookupState {
  lookupPostcode: (postcode: string) => Promise<void>
  isValidPostcode: (postcode: string) => boolean
  resetError: () => void
}

/**
 * Hook for looking up UK postcodes and getting coordinates
 */
export function usePostcodeLookup(): PostcodeLookupResult {
  const [state, setState] = useState<PostcodeLookupState>({
    loading: false,
    error: null,
    coordinates: null,
  })

  const lookupPostcode = async (postcode: string) => {
    if (!postcode || !isValidUKPostcode(postcode)) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a valid UK postcode',
      }))
      return
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      const result = await getPostcodeCoordinates(postcode)

      if (result.success && result.data) {
        setState({
          loading: false,
          error: null,
          coordinates: result.data,
        })
      } else {
        setState({
          loading: false,
          error: result.error || 'Failed to lookup postcode',
          coordinates: null,
        })
      }
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        coordinates: null,
      })
    }
  }

  const resetError = () => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }

  return {
    ...state,
    lookupPostcode,
    isValidPostcode: isValidUKPostcode,
    resetError,
  }
}
