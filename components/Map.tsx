import { useRef, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { useLeafletMap, Location } from '@/hooks/useLeafletMap'

interface MapProps {
  selectedLocation?: Location
  markers?: Location[]
  onMarkerClick?: (location: Location) => void
  zoom?: number
  height?: string
}

/**
 * A reusable map component using Leaflet
 * 
 * This component is responsible for:
 * - Rendering the map container
 * - Passing props to the useLeafletMap hook
 * - Updating the map view when selectedLocation changes
 */
const Map = ({
  selectedLocation = { lat: 51.505, lng: -0.09 }, // Default to London
  markers = [],
  onMarkerClick,
  zoom = 13,
  height = '400px',
}: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Use our custom hook to manage the map
  const { isMapReady, setView } = useLeafletMap({
    containerRef: mapContainerRef,
    initialLocation: selectedLocation,
    markers,
    onMarkerClick,
    zoom,
  })

  // Update view when selected location changes
  useEffect(() => {
    if (isMapReady && selectedLocation) {
      setView(selectedLocation, zoom)
    }
  }, [selectedLocation, zoom, isMapReady, setView])

  return <div ref={mapContainerRef} style={{ height, width: '100%' }} data-testid="map-container" />
}

export default Map