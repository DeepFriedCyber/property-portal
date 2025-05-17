import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

// Define the location type
export interface Location {
  lat: number
  lng: number
}

interface UseLeafletMapProps {
  containerRef: React.RefObject<HTMLDivElement>
  initialLocation?: Location
  markers?: Location[]
  onMarkerClick?: (location: Location) => void
  zoom?: number
}

interface UseLeafletMapReturn {
  isMapReady: boolean
  setView: (location: Location, zoom?: number) => void
  updateMarkers: (newMarkers: Location[]) => void
}

/**
 * Custom hook for managing a Leaflet map
 * 
 * This hook handles:
 * - Map initialization and cleanup
 * - Setting the map view
 * - Managing markers
 * - Handling marker clicks
 */
export function useLeafletMap({
  containerRef,
  initialLocation = { lat: 51.505, lng: -0.09 }, // Default to London
  markers = [],
  onMarkerClick,
  zoom = 13,
}: UseLeafletMapProps): UseLeafletMapReturn {
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Create map instance
    const map = L.map(containerRef.current).setView(
      [initialLocation.lat, initialLocation.lng],
      zoom
    )

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Create a layer group for markers
    markersLayerRef.current = L.layerGroup().addTo(map)
    
    // Store map reference
    mapRef.current = map
    setIsMapReady(true)

    // Cleanup on unmount - IMPORTANT to prevent memory leaks
    return () => {
      if (mapRef.current) {
        // Remove all event listeners
        mapRef.current.off()
        mapRef.current.remove()
        mapRef.current = null
        markersLayerRef.current = null
        setIsMapReady(false)
      }
    }
  }, [containerRef, initialLocation.lat, initialLocation.lng, zoom])

  // Function to set the map view
  const setView = (location: Location, newZoom?: number) => {
    if (!mapRef.current) return
    mapRef.current.setView([location.lat, location.lng], newZoom || zoom)
  }

  // Function to update markers
  const updateMarkers = (newMarkers: Location[]) => {
    if (!markersLayerRef.current) return
    
    // Clear existing markers
    markersLayerRef.current.clearLayers()
    
    // Add new markers
    newMarkers.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
      
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(location))
      }
      
      marker.addTo(markersLayerRef.current!)
    })
  }

  // Update markers when markers array changes
  useEffect(() => {
    if (isMapReady) {
      updateMarkers(markers)
    }
  }, [markers, onMarkerClick, isMapReady])

  return {
    isMapReady,
    setView,
    updateMarkers
  }
}