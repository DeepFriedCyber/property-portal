'use client'

import React, { useState } from 'react'
import LocationSearch from '@/components/LocationSearch'
import { LocationResult } from '@/lib/services/locationService'

/**
 * Example page demonstrating the UK location search and autocomplete functionality
 */
export default function LocationSearchExample() {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)

  const handleLocationSelect = (location: LocationResult) => {
    console.log('Selected location:', location)
    setSelectedLocation(location)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">UK Location Search</h1>

        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Search for UK postcodes, cities, towns, or addresses. Try typing a partial postcode like
            "SW1" or a place name like "Manchester".
          </p>

          <LocationSearch
            onSelect={handleLocationSelect}
            placeholder="Enter a UK postcode or location"
            className="w-full"
          />
        </div>

        {selectedLocation && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Selected Location</h2>

            <div className="space-y-2">
              <p>
                <span className="font-medium">Location:</span> {selectedLocation.label}
              </p>
              <p>
                <span className="font-medium">Latitude:</span> {selectedLocation.lat}
              </p>
              <p>
                <span className="font-medium">Longitude:</span> {selectedLocation.lng}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Map Preview</h3>
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${selectedLocation.lat},${selectedLocation.lng}&zoom=15`}
                  allowFullScreen
                ></iframe>
                <p className="text-xs text-center mt-1 text-gray-500">
                  Note: Replace YOUR_GOOGLE_MAPS_API_KEY with an actual API key to see the map
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Implementation Notes</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>This component uses the MapTiler Geocoding API for UK location search</li>
            <li>
              Make sure to set the{' '}
              <code className="bg-gray-200 px-1 rounded">MAPTILER_API_KEY</code> environment
              variable
            </li>
            <li>The search is debounced to prevent excessive API calls</li>
            <li>Results are limited to UK locations only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}