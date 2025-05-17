'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';

import { formatCurrency } from '@/lib/utils/formatters';

interface PropertyListProps {
  properties: Property[];
  totalCount: number;
  page: number;
  totalPages: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PropertyList({
  properties,
  totalCount,
  page,
  totalPages,
  searchParams,
}: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const metadata = property.metadata || {};
          return (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="group block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                {metadata.mainImageUrl ? (
                  <Image
                    src={metadata.mainImageUrl}
                    alt={metadata.title || property.address}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  {metadata.title || property.address}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {property.address}, {property.city}, {property.zipCode}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(property.price)}
                    {metadata.listingType === 'rent' && (
                      <span className="text-sm font-normal"> pcm</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'} •{' '}
                    {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
                  </p>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      metadata.listingType === 'sale'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {metadata.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                  >
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {page > 1 && (
              <Link
                href={{
                  pathname: '/properties',
                  query: { ...searchParams, page: page - 1 },
                }}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = page <= 3 ? i + 1 : page - 2 + i;
              if (pageNumber > totalPages) return null;
              return (
                <Link
                  key={pageNumber}
                  href={{
                    pathname: '/properties',
                    query: { ...searchParams, page: pageNumber },
                  }}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pageNumber
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}

            {page < totalPages && (
              <Link
                href={{
                  pathname: '/properties',
                  query: { ...searchParams, page: page + 1 },
                }}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
