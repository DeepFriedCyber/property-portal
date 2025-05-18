import { useState, useCallback } from 'react'

import { Property } from '@/types/property'

import { Location } from '../hooks/useLeafletMap'

import Map from './Map'

interface PropertyMapProps {
  property: Property
  nearbyProperties?: Property[]
}

/**
 * A component that displays a property on a map along with nearby properties
 */
const PropertyMap = ({ property, nearbyProperties = [] }: PropertyMapProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property>(property)

  // Extract location from property - memoized to avoid unnecessary recalculations
  const getLocation = useCallback((prop: Property): Location => {
    return {
      lat: prop.lat,
      lng: prop.lng,
    }
  }, [])

  // Create markers for nearby properties
  const markers = nearbyProperties.map(prop => getLocation(prop))

  // Handle marker click
  const handleMarkerClick = useCallback(
    (location: Location) => {
      // Find the property that matches this location
      const clickedProperty = nearbyProperties.find(
        prop => prop.lat === location.lat && prop.lng === location.lng
      )

      if (clickedProperty) {
        setSelectedProperty(clickedProperty)
      }
    },
    [nearbyProperties]
  )

  // Reset to main property
  const handleResetProperty = useCallback(() => {
    setSelectedProperty(property)
  }, [property])

  return (
    <div className="property-map-container">
      <h3 className="text-xl font-semibold mb-2">Property Location</h3>
      <Map
        selectedLocation={getLocation(selectedProperty)}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        zoom={15}
        height="500px"
      />

      {selectedProperty.id !== property.id && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h4 className="font-medium">Selected Nearby Property</h4>
          <p>{selectedProperty.title}</p>
          <p>{selectedProperty.location}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleResetProperty}
            aria-label="Return to main property"
          >
            Back to Main Property
          </button>
        </div>
      )}
    </div>
  )
}

export default PropertyMap
