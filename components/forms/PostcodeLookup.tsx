'use client'

import React, { useState } from 'react'

import { isValidUKPostcode } from '@lib/utils/geocoding'

import { getPostcodeCoordinates } from '@/app/actions/geocoding'

interface PostcodeLookupProps {
  postcode: string
  onPostcodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCoordinatesFound: (lat: number, lng: number) => void
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A component for looking up UK postcodes and getting coordinates
 */
export const PostcodeLookup: React.FC<PostcodeLookupProps> = ({
  postcode,
  onPostcodeChange,
  onCoordinatesFound,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!postcode) {
      setLocalError('Please enter a postcode')
      return
    }

    if (!isValidUKPostcode(postcode)) {
      setLocalError('Please enter a valid UK postcode')
      return
    }

    setLocalError(null)
    setLoading(true)

    try {
      const result = await getPostcodeCoordinates(postcode)

      if (result.success && result.data) {
        onCoordinatesFound(result.data.lat, result.data.lng)
      } else {
        setLocalError(result.error || 'Failed to lookup postcode')
      }
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      err
    ) {
      setLocalError('Failed to lookup postcode')
    } finally {
      setLoading(false)
    }
  }

  const displayError = (touched && error) || localError

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2">
        <div className="flex-grow">
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
            UK Postcode {required && <span className="text-red-500">*</span>}
          </label>
          <input
            id="postcode"
            name="postcode"
            type="text"
            value={postcode}
            onChange={onPostcodeChange}
            disabled={disabled || loading}
            placeholder="SW1A 1AA"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              displayError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleLookup}
            disabled={disabled || loading || !postcode || !isValidUKPostcode(postcode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 h-10"
          >
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </div>
      </div>

      {displayError && <p className="mt-1 text-sm text-red-600">{displayError}</p>}

      <p className="mt-1 text-xs text-gray-500">
        Enter a UK postcode to automatically get coordinates
      </p>
    </div>
  )
}
