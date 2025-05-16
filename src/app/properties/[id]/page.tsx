import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getProperty } from '@/app/actions/properties'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import PropertyTimestamps from '@/app/components/PropertyTimestamps'
import { formatCurrency, formatSquareFootage, capitalize } from '@/lib/utils/formatters'
import { Property } from '@/types/property'

export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const result = await getProperty(params.id)
  if (!result.success || !result.data) return {}

  const property = result.data
  const metadata = property.metadata || {}
  const title = metadata.title || property.address

  return {
    title: title,
    description: `View listing for ${title}`,
    openGraph: {
      title: title,
      images: [metadata.mainImageUrl],
    },
  }
}

// Using the centralized Property type from @/types/property

// Property detail content component
function PropertyDetailContent({ property }: { property: Property }) {
  const metadata = property.metadata || {}

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
      {/* Image gallery */}
      <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden relative">
        {metadata.mainImageUrl ? (
          <Image
            src={metadata.mainImageUrl}
            alt={metadata.title || property.address}
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
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {metadata.title || property.address}
        </h1>

        <div className="mt-3">
          <h2 className="sr-only">Property information</h2>
          <p className="text-3xl text-gray-900">
            {formatCurrency(property.price)}
            {metadata.listingType === 'rent' && <span className="text-lg font-normal"> pcm</span>}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="sr-only">Description</h3>
          <div className="text-base text-gray-700 space-y-6">
            <p>{property.description}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                metadata.listingType === 'sale'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {metadata.listingType === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {capitalize(property.type)}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {capitalize(property.status.replace('_', ' '))}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Address</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>{property.address}</p>
              {metadata.addressLine2 && <p>{metadata.addressLine2}</p>}
              <p>
                {property.city}, {property.state}
              </p>
              <p>{property.zipCode}</p>
              <p>{property.country}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Property Details</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
              </p>
              <p>
                {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
              </p>
              {metadata.receptionRooms && (
                <p>
                  {metadata.receptionRooms}{' '}
                  {metadata.receptionRooms === 1 ? 'Reception Room' : 'Reception Rooms'}
                </p>
              )}
              {property.squareFeet && property.squareFeet > 0 && (
                <p>{formatSquareFootage(property.squareFeet)}</p>
              )}
              {metadata.tenure && <p>Tenure: {capitalize(metadata.tenure.replace('_', ' '))}</p>}
              {metadata.councilTaxBand && <p>Council Tax Band: {metadata.councilTaxBand}</p>}
              {metadata.epcRating && <p>EPC Rating: {metadata.epcRating}</p>}
            </div>
          </div>
        </div>

        {property.features && property.features.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Features</h3>
            <div className="mt-2">
              <ul className="pl-4 list-disc text-sm space-y-2">
                {property.features.map((feature: string, index: number) => (
                  <li key={index} className="text-gray-500">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Display the timestamps */}
        <section aria-label="Timestamps" className="mt-6">
          <PropertyTimestamps
            createdAt={new Date(property.createdAt)}
            updatedAt={property.updatedAt ? new Date(property.updatedAt) : null}
          />
        </section>
      </div>
    </div>
  )
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
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Data fetching component
async function PropertyDetailData({ id }: { id: string }) {
  const result = await getProperty(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <PropertyDetailContent property={result.data} />
}

// Main page component
export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorBoundary>
        <Suspense fallback={<PropertyDetailSkeleton />}>
          <PropertyDetailData id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
