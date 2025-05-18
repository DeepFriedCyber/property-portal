import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { fetchPropertyById, fetchNearbyProperties } from '@/lib/api'
import PropertyCard from '@/components/PropertyCard'

export const dynamic = 'force-dynamic'

interface PropertyPageProps {
  params: { id: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { property } = await fetchPropertyById(params.id)

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  return {
    title: `${property.title} | Property Portal`,
    description: `View details for ${property.title} located in ${property.location}`,
    keywords: `property, real estate, ${property.location}`,
    openGraph: {
      title: `${property.title} | Property Portal`,
      description: `View details for ${property.title} at ${property.location}`,
      images: [
        {
          url: property.imageUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} | Property Portal`,
      description: `View details for ${property.title} at ${property.location}`,
      images: [property.imageUrl],
    },
  }
}

// Loading skeleton for property detail
function PropertyDetailSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-300"></div>

      {/* Content skeleton */}
      <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Data fetching component
async function PropertyDetailData({ id }: { id: string }) {
  const { property, error } = await fetchPropertyById(id)

  if (!property || error) {
    notFound()
  }

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price)

  // Fetch nearby properties
  const nearbyProperties = await fetchNearbyProperties(
    property.id,
    property.lat,
    property.lng,
    20, // 20km radius
    3 // 3 properties
  )

  return (
    <>
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
            <div
              className="w-full h-full bg-gray-200 flex items-center justify-center"
              aria-label="No property image available"
            >
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Property info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{property.title}</h1>

          <div className="mt-3">
            <h2 className="sr-only">Property information</h2>
            <p className="text-3xl text-gray-900">{formattedPrice}</p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Location</h3>
            <div className="text-base text-gray-700 space-y-6">
              <p>{property.location}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Location</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>{property.location}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Coordinates</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Latitude: {property.lat.toFixed(6)}</p>
                <p>Longitude: {property.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>

          {/* Map section */}
          <section aria-label="Map" className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Map Location</h3>
            <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Map view would be displayed here</p>
            </div>
          </section>
        </div>
      </div>

      {nearbyProperties.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Nearby Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {nearbyProperties.map(nearbyProperty => (
              <PropertyCard key={nearbyProperty.id} property={nearbyProperty} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Main page component
export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/properties" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to all properties
      </Link>

      <Suspense fallback={<PropertyDetailSkeleton />}>
        <PropertyDetailData id={params.id} />
      </Suspense>
    </div>
  )
}
