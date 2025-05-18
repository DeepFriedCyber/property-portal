'use client'

import Image from 'next/image'

import { Property } from '@/types/property'

interface PropertyDetailContentProps {
  property: Property
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
            className="object-center object-cover"
            style={{ objectFit: 'cover' }}
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

        <div className="mt-3">
          <h2 className="sr-only">Property information</h2>
          <p className="text-3xl text-gray-900 dark:text-white">
            ${property.price.toLocaleString()}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="sr-only">Location</h3>
          <div className="text-base text-gray-700 dark:text-gray-300 space-y-6">
            <p>{property.location}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Location</h3>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>{property.location}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Coordinates</h3>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Latitude: {property.lat.toFixed(6)}</p>
              <p>Longitude: {property.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>

        {/* Map section */}
        <section aria-label="Map" className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Map Location</h3>
          <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Map view would be displayed here</p>
          </div>
        </section>
      </div>
    </div>
  )
}
