'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/property'
import { formatCurrency } from '@/lib/utils/formatters'

interface PropertyCardProps extends Property {
  href?: string
}

/**
 * A reusable property card component that displays property information
 * Uses the spread operator to accept all Property props
 */
export default function PropertyCard({
  id,
  title,
  description,
  price,
  type,
  status,
  bedrooms,
  bathrooms,
  squareFeet,
  address,
  city,
  metadata,
  href = `/properties/${id}`,
  ...rest
}: PropertyCardProps) {
  // Format location
  const location = `${address}, ${city}`
  
  // Get main image URL or use placeholder
  const imageUrl = metadata?.mainImageUrl || 'https://placehold.co/600x400/png?text=Property'
  
  // Get listing type (sale/rent)
  const listingType = metadata?.listingType || 'sale'

  return (
    <Link
      href={href}
      className="group block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || address}
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
          {title || metadata?.title || address}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {location}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(price)}
            {listingType === 'rent' && (
              <span className="text-sm font-normal"> pcm</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {bedrooms} {bedrooms === 1 ? 'bed' : 'beds'} •{' '}
            {bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}
          </p>
        </div>
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              listingType === 'sale'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {listingType === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          <span
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}