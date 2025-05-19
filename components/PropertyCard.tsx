import Link from 'next/link'
import React from 'react'

import { formatGBP } from '@/lib/currency'
import { Property } from '@/types/property'

import PropertyAmenities from './PropertyAmenities'

interface PropertyCardProps extends Property {
  onViewDetails?: (id: string) => void
}

/**
 * A reusable property card component that displays property information
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  price,
  bedrooms,
  bathrooms,
  squareFeet,
  address,
  city,
  metadata,
  lat,
  lng,
  onViewDetails,
  ...rest
}) => {
  // Format price as currency using the utility function

  // Get main image URL or use placeholder
  const imageUrl = metadata?.mainImageUrl || 'https://placehold.co/600x400/png?text=Property'

  // Format location
  const location = `${city}${address ? `, ${address}` : ''}`

  // Handle view details click
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id)
    }
  }

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
      aria-labelledby={`property-title-${id}`}
    >
      <div className="h-48 bg-gray-200">
        <img src={imageUrl} alt={`Property: ${title}`} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 id={`property-title-${id}`} className="text-xl font-semibold mb-2">
          {title || metadata?.title || 'Property Listing'}
        </h3>
        <p className="text-blue-600 font-bold mt-2">{formatGBP(price)}</p>
        <p className="text-gray-600 mb-2">{location}</p>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span aria-label={`${bedrooms} bedrooms`}>{bedrooms} beds</span>
          <span aria-label={`${bathrooms} bathrooms`}>{bathrooms} baths</span>
          <span aria-label={`Area: ${squareFeet} sq ft`}>{squareFeet} sq ft</span>
        </div>
        <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>
        <PropertyAmenities lat={lat} lng={lng} />

        {onViewDetails ? (
          // Use callback if provided (for custom handling)
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            onClick={handleViewDetails}
            aria-label={`View details for ${title || 'this property'}`}
          >
            View Details
          </button>
        ) : (
          // Otherwise use direct link to property page
          <Link href={`/properties/${id}`} passHref>
            <span
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-center cursor-pointer"
              aria-label={`View details for ${title || 'this property'}`}
            >
              View Details
            </span>
          </Link>
        )}
      </div>
    </article>
  )
}

export default PropertyCard
