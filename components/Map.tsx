import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Define the location type
interface Location {
  lat: number
  lng: number
}

interface MapProps {
  selectedLocation?: Location
  markers?: Location[]
  onMarkerClick?: (location: Location) => void
  zoom?: number
  height?: string
}

const Map = ({
  selectedLocation,
  markers = [],
  onMarkerClick,
  zoom = 13,
  height = '400px',
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialize the map
      const map = L.map(mapContainerRef.current).setView(
        selectedLocation || [51.505, -0.09], // Default to London if no location
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
      setIsMapInitialized(true)
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersLayerRef.current = null
        setIsMapInitialized(false)
      }
    }
  }, [zoom]) // Only re-initialize if zoom changes

  // Update view when selected location changes
  useEffect(() => {
    if (isMapInitialized && mapRef.current && selectedLocation) {
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], zoom)
    }
  }, [selectedLocation, zoom, isMapInitialized])

  // Update markers when markers array changes
  useEffect(() => {
    if (isMapInitialized && markersLayerRef.current) {
      // Clear existing markers
      markersLayerRef.current.clearLayers()
      
      // Add new markers
      markers.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
        
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(location))
        }
        
        marker.addTo(markersLayerRef.current!)
      })
    }
  }, [markers, onMarkerClick, isMapInitialized])

  return <div ref={mapContainerRef} style={{ height, width: '100%' }} />
}

export default Map