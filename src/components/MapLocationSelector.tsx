'use client'

import { useState, useEffect } from 'react'

import { useMapStore, MapPosition } from '@/store/useStore'

interface MapLocationSelectorProps {
  initialLocation?: MapPosition
  onLocationChange?: (location: MapPosition) => void
}

/**
 * Component for selecting a location on the map
 * Uses the global store for state management
 */
export default function MapLocationSelector({
  initialLocation,
  onLocationChange,
}: MapLocationSelectorProps) {
  // Local state for the input fields
  const [localLat, setLocalLat] = useState(initialLocation?.lat.toString() || '')
  const [localLng, setLocalLng] = useState(initialLocation?.lng.toString() || '')

  // Get the selected location from the store
  const { selectedLocation, setSelectedLocation } = useMapStore()

  // Update local state when the selected location changes
  useEffect(() => {
    if (selectedLocation) {
      setLocalLat(selectedLocation.lat.toString())
      setLocalLng(selectedLocation.lng.toString())
    }
  }, [selectedLocation])

  // Update the store and call the callback when the location changes
  const handleLocationChange = () => {
    const lat = parseFloat(localLat)
    const lng = parseFloat(localLng)

    if (!isNaN(lat) && !isNaN(lng)) {
      const newLocation: MapPosition = { lat, lng }
      setSelectedLocation(newLocation)

      if (onLocationChange) {
        onLocationChange(newLocation)
      }
    }
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-4">Select Location</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <input
            type="text"
            id="latitude"
            value={localLat}
            onChange={e => setLocalLat(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-describedby="latitude-help"
          />
          <div id="latitude-help" className="mt-1 text-xs text-gray-500">
            Enter the latitude coordinate (e.g., 51.505)
          </div>
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <input
            type="text"
            id="longitude"
            value={localLng}
            onChange={e => setLocalLng(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-describedby="longitude-help"
          />
          <div id="longitude-help" className="mt-1 text-xs text-gray-500">
            Enter the longitude coordinate (e.g., -0.09)
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLocationChange}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Update map location with entered coordinates"
      >
        Update Location
      </button>

      {selectedLocation && (
        <div className="mt-4 text-sm text-gray-500">
          <p>
            Selected location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
