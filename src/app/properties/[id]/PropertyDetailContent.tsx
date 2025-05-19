'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'

import { formatGBP } from '@/lib/currency'
import { Property } from '@/types/property'

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import('../../../../components/Map'), { ssr: false })

interface PropertyDetailContentProps {
  property: Property
}

// Detail component for property attributes
function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium dark:text-white">{value ?? 'N/A'}</p>
    </div>
  )
}

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
      {/* Image gallery */}
      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden relative">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={`Property image of ${property.title} at ${property.location}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            className="object-center object-cover rounded shadow"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      {/* Property info */}
      <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {property.title}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {property.location} {property.postcode ? `· ${property.postcode}` : ''}
        </p>

        <div className="mt-3">
          <h2 className="sr-only">Property information</h2>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {formatGBP(property.price)}
          </p>
        </div>

        <div className="mt-6">
          <div className="text-base text-gray-700 dark:text-gray-300 space-y-6">
            <p>{property.description}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
          <Detail label="Council Tax Band" value={property.councilTaxBand} />
          <Detail label="Tenure" value={property.tenure} />
          <Detail label="EPC Rating" value={property.epcRating} />
        </div>

        {/* Map section */}
        <section aria-label="Map" className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Map & Location</h3>
          <div className="h-64 rounded-md overflow-hidden">
            <Map selectedLocation={{ lat: property.lat, lng: property.lng }} />
          </div>
        </section>
      </div>
    </div>
  )
}
