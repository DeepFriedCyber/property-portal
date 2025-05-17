import Link from 'next/link';
import { Suspense } from 'react';
import { getProperties } from '@/app/actions/properties';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import PropertyList from '@/app/components/PropertyList';
import ErrorDisplay from '@/app/components/ErrorDisplay';
import ErrorBoundary from '@/app/components/ErrorBoundary';

export const dynamic = 'force-dynamic';

// This component handles the data fetching and passes it to the PropertyList component
async function PropertyListContainer({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Parse search parameters
  const listingType = searchParams.listingType as 'sale' | 'rent' | undefined;
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice as string) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice as string) : undefined;
  const bedrooms = searchParams.bedrooms ? parseInt(searchParams.bedrooms as string) : undefined;
  const propertyType = searchParams.propertyType as string | undefined;
  const location = searchParams.location as string | undefined;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Fetch properties using server action
  const result = await getProperties({
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    propertyType,
    location,
    limit,
    offset,
  });

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to load properties');
  }

  const { properties, totalCount } = result.data;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <PropertyList 
      properties={properties} 
      totalCount={totalCount} 
      page={page} 
      totalPages={totalPages} 
      searchParams={searchParams} 
    />
  );
}

export default function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
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
  );
}