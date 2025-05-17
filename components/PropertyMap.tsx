import { useState } from 'react'
import Map from './Map'
import { Property } from '@/types/property'

interface PropertyMapProps {
  property: Property
  nearbyProperties?: Property[]
}

const PropertyMap = ({ property, nearbyProperties = [] }: PropertyMapProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property>(property)
  
  // Extract location from property
  const getLocation = (prop: Property) => {
    // This is a simplified example - you would need to extract real coordinates
    // from your property data structure
    return {
      lat: prop.latitude || 51.505, // Default to London if not available
      lng: prop.longitude || -0.09,
    }
  }
  
  // Create markers for nearby properties
  const markers = nearbyProperties.map(prop => getLocation(prop))
  
  // Handle marker click
  const handleMarkerClick = (location: { lat: number; lng: number }) => {
    // Find the property that matches this location
    const clickedProperty = nearbyProperties.find(
      prop => prop.latitude === location.lat && prop.longitude === location.lng
    )
    
    if (clickedProperty) {
      setSelectedProperty(clickedProperty)
    }
  }
  
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
          <p>{selectedProperty.address}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setSelectedProperty(property)}
          >
            Back to Main Property
          </button>
        </div>
      )}
    </div>
  )
}

export default PropertyMap