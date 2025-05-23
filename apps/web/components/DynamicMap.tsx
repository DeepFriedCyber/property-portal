'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Define the MapProps interface to match the one in the UI package
interface MapProps {
  center?: [number, number]
  zoom?: number
}

// Import Map component from the UI package with proper typing
const MapComponent = dynamic<MapProps>(
  () => import('../../../packages/ui/components/Map').then(mod => mod.Map),
  {
    ssr: false,
    loading: () => <p className="text-center">Loading map...</p>,
  }
)

export default function DynamicMap() {
  return (
    <Suspense fallback={<p className="text-center p-4">Map is loading...</p>}>
      <MapComponent center={[40.71, -74.01]} zoom={12} />
    </Suspense>
  )
}
