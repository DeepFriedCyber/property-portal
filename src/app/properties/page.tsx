import Link from 'next/link'
import { Suspense } from 'react'
import LoadingSkeleton from '@/app/components/LoadingSkeleton'
import PropertyList from '@/app/components/PropertyList'
import ErrorBoundary from '@/app/components/ErrorBoundary'
import { fetchProperties } from '@/lib/api'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse Properties',
  description: 'Browse our extensive collection of properties for sale and rent. Filter by price, location, bedrooms and more to find your perfect home.',
  keywords: 'property listings, houses for sale, apartments for rent, property search',
  openGraph: {
    title: 'Browse Properties | Property Portal',
    description: 'Find your perfect property with our advanced search filters.',
    images: [
      {
        url: 'https://property-portal.com/images/properties-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Property listings',
      },
    ],
  },
}

/**
 * This component handles the data fetching and passes it to the PropertyList component
 * Uses the fetchProperties API function for cleaner code
 */
async function PropertyListContainer({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse search parameters
  const listingType = searchParams.listingType as 'sale' | 'rent' | undefined
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice as string) : undefined
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice as string) : undefined
  const bedrooms = searchParams.bedrooms ? parseInt(searchParams.bedrooms as string) : undefined
  const propertyType = searchParams.propertyType as string | undefined
  const location = searchParams.location as string | undefined
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1
  const limit = 10
  const offset = (page - 1) * limit

  // Fetch properties using our API utility
  const { properties, totalCount, error } = await fetchProperties({
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    propertyType,
    location,
    limit,
    offset,
  })

  if (error) {
    throw new Error(error)
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <PropertyList
      properties={properties}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      searchParams={searchParams}
    />
  )
}

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <Link
          href="/properties/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Property
        </Link>
      </div>

      {/* Filter UI would go here */}

      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton />}>
          <PropertyListContainer searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
