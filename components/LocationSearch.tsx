import React, { useState, useEffect, useRef } from 'react'

import { LocationResult } from '../lib/services/locationService'

interface LocationSearchProps {
  onSelect?: (location: LocationResult) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

/**
 * Location Search component with autocomplete for UK postcodes and locations
 */
export default function LocationSearch({
  onSelect,
  placeholder = 'Search for a location or postcode',
  className = '',
  initialValue = '',
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the component to close the results dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch location suggestions when query changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch location data')
        }

        const data = await response.json()
        setResults(data.results)
        setShowResults(true)
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch location data')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchLocations()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle selection of a location from the results
  const handleSelect = (location: LocationResult) => {
    setQuery(location.label)
    setShowResults(false)
    if (onSelect) {
      onSelect(location)
    }
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search for a location"
          aria-expanded={showResults}
          aria-autocomplete="list"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}

      {showResults && results.length > 0 && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {results.map((location, index) => (
            <li
              key={`${location.label}-${index}`}
              onClick={() => handleSelect(location)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              role="option"
              aria-selected={false}
            >
              {location.label}
            </li>
          ))}
        </ul>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
          No locations found
        </div>
      )}
    </div>
  )
}
