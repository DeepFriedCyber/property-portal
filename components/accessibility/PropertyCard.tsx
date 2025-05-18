// PropertyCard.tsx
import React from 'react'

import AccessibleButton from './AccessibleButton'

interface PropertyCardProps {
  id: string
  title: string
  price: number
  address: string
  bedrooms: number
  bathrooms: number
  area: number
  imageUrl?: string
  onViewDetails: (id: string) => void
  onSaveProperty?: (id: string) => void
  isSaved?: boolean
  className?: string
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  address,
  bedrooms,
  bathrooms,
  area,
  imageUrl,
  onViewDetails,
  onSaveProperty,
  isSaved = false,
  className = '',
}) => {
  // Format price with commas
  const formattedPrice = price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  // Handle view details click
  const handleViewDetails = () => {
    onViewDetails(id)
  }

  // Handle save property click
  const handleSaveProperty = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    if (onSaveProperty) {
      onSaveProperty(id)
    }
  }

  return (
    <article className={`property-card ${className}`} aria-labelledby={`property-title-${id}`}>
      {/* Property image with proper alt text */}
      <div className="property-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={`Exterior view of ${title}`} className="property-image" />
        ) : (
          <div className="property-image-placeholder" aria-label="No image available">
            No image available
          </div>
        )}

        {/* Save button */}
        {onSaveProperty && (
          <AccessibleButton
            onClick={handleSaveProperty}
            ariaLabel={isSaved ? 'Remove from saved properties' : 'Save property'}
            ariaPressed={isSaved}
            className={`save-button ${isSaved ? 'saved' : ''}`}
          >
            <span aria-hidden="true">{isSaved ? '❤️' : '🤍'}</span>
          </AccessibleButton>
        )}
      </div>

      <div className="property-content">
        {/* Price */}
        <div className="property-price" aria-label={`Price: ${formattedPrice}`}>
          {formattedPrice}
        </div>

        {/* Title */}
        <h2 id={`property-title-${id}`} className="property-title">
          {title}
        </h2>

        {/* Address */}
        <address className="property-address">{address}</address>

        {/* Property details with proper semantics */}
        <dl className="property-details">
          <div className="detail-item">
            <dt className="visually-hidden">Bedrooms</dt>
            <dd>
              <span aria-hidden="true">🛏️</span> {bedrooms} {bedrooms === 1 ? 'bed' : 'beds'}
            </dd>
          </div>

          <div className="detail-item">
            <dt className="visually-hidden">Bathrooms</dt>
            <dd>
              <span aria-hidden="true">🚿</span> {bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}
            </dd>
          </div>

          <div className="detail-item">
            <dt className="visually-hidden">Area</dt>
            <dd>
              <span aria-hidden="true">📏</span> {area.toLocaleString()} sq ft
            </dd>
          </div>
        </dl>

        {/* View details button */}
        <AccessibleButton
          onClick={handleViewDetails}
          className="view-details-button"
          ariaLabel={`View details for ${title}`}
        >
          View Details
        </AccessibleButton>
      </div>
    </article>
  )
}

export default PropertyCard
