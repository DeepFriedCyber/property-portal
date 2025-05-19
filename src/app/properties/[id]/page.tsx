import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import ErrorBoundary from '@/app/components/ErrorBoundary'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { fetchPropertyById, fetchProperties } from '@/lib/api'

import PropertyAmenities from '../../../../components/PropertyAmenities'

import NearbyProperties from './NearbyProperties'
import PropertyDetailContent from './PropertyDetailContent'

// Generate static paths for better performance
export async function generateStaticParams() {
  try {
    const { properties } = await fetchProperties('', 1, 100)
    return properties.map(p => ({ id: p.id }))
  } catch (error) {
    // If fetching fails, return empty array - will fall back to dynamic rendering
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { property } = await fetchPropertyById(params.id)

    if (!property) {
      return {
        title: 'Property Not Found | Property Portal',
        description: 'The requested property could not be found.',
      }
    }

    return {
      title: `${property.title} | Property Portal`,
      description: `View details for ${property.title} located in ${property.location || property.address || ''}`,
      keywords: `property, real estate, ${property.location || property.address || ''}`,
      openGraph: {
        title: `${property.title} | Property Portal`,
        description: `View details for ${property.title} at ${property.address}`,
        images: [
          {
            url: property.metadata?.mainImageUrl || '',
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
        description: `View details for ${property.title} at ${property.address}`,
        images: [property.metadata?.mainImageUrl || ''],
      },
    }
  } catch (error) {
    return {
      title: 'Property Details | Property Portal',
      description: 'View detailed information about this property.',
    }
  }
}

// Loading skeleton for property detail
function PropertyDetailSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
      {/* Image skeleton */}
      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/3" />

        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
          <div>
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        {/* Map skeleton */}
        <div>
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-64 w-full rounded-md" />
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

  return (
    <>
      <PropertyDetailContent property={property} />

      {/* Amenities section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Nearby Amenities</h2>
        <PropertyAmenities lat={property.lat} lng={property.lng} />
      </div>

      {/* Nearby properties section */}
      <Suspense
        fallback={
          <div className="mt-12">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Skeleton className="h-64 w-full rounded-md" />
              <Skeleton className="h-64 w-full rounded-md" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          </div>
        }
      >
        <NearbyProperties propertyId={property.id} lat={property.lat} lng={property.lng} />
      </Suspense>
    </>
  )
}

// Main page component
export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/properties" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to all properties
      </Link>

      <ErrorBoundary>
        <Suspense fallback={<PropertyDetailSkeleton />}>
          <PropertyDetailData id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
