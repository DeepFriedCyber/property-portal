// External imports
import { Metadata } from 'next'
import { Suspense } from 'react'

// Internal imports
import ErrorBoundary from '@/app/components/ErrorBoundary'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { fetchPropertyById } from '@/lib/api'

// Local imports
import PropertyDetailData from './PropertyDetailData'

// Generate dynamic metadata for the property detail page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { property } = await fetchPropertyById(params.id)

    if (!property) {
      return {
        title: 'Property Not Found | Property Portal',
        description: 'The requested property could not be found.',
      }
    }

    const metadata: Metadata = {
      title: `${property.title} | Property Portal`,
      description: `View details for ${property.title} located at ${property.location}. Priced at $${property.price.toLocaleString()}.`,
    }

    // Only add openGraph images if imageUrl exists
    if (property.imageUrl) {
      metadata.openGraph = {
        images: [property.imageUrl],
      }
    }

    return metadata
  } catch (_) {
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

        <div className="flex space-x-2">
          <Skeleton className="h-6 rounded-full w-20" />
          <Skeleton className="h-6 rounded-full w-20" />
          <Skeleton className="h-6 rounded-full w-20" />
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
