// PropertyListingWithLoaders.tsx
import React, { useState, useEffect } from 'react'

import ErrorBoundary from './ErrorBoundary'
import PropertyCardSkeleton from './loaders/PropertyCardSkeleton'
import Spinner from './loaders/Spinner'

interface Property {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  description: string
  imageUrl?: string
}

// Different loading state types
type LoadingState = 'idle' | 'loading' | 'skeleton' | 'success' | 'error'

const PropertyListingWithLoaders: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)

  // For demo purposes - toggle between different loading states
  const [loaderType, setLoaderType] = useState<'spinner' | 'skeleton'>('skeleton')

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Set loading state based on selected loader type
        setLoadingState(loaderType === 'spinner' ? 'loading' : 'skeleton')

        // Simulate API call with delay
        const response = await new Promise<Property[]>(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: '1',
                address: '123 Main St, Anytown, USA',
                price: 350000,
                bedrooms: 3,
                bathrooms: 2,
                area: 1800,
                type: 'Single Family Home',
                description: 'Beautiful home with modern amenities in a quiet neighborhood.',
              },
              {
                id: '2',
                address: '456 Oak Ave, Somewhere, USA',
                price: 425000,
                bedrooms: 4,
                bathrooms: 2.5,
                area: 2200,
                type: 'Townhouse',
                description: 'Spacious townhouse with updated kitchen and private backyard.',
              },
              {
                id: '3',
                address: '789 Pine Rd, Elsewhere, USA',
                price: 275000,
                bedrooms: 2,
                bathrooms: 1,
                area: 1200,
                type: 'Condo',
                description: 'Cozy condo in the heart of downtown with amazing city views.',
              },
            ])
          }, 2000) // 2 second delay to show loading state
        })

        setProperties(response)
        setLoadingState('success')
        setError(null)
      } catch (err) {
        setLoadingState('error')
        setError('Failed to load properties. Please try again.')
        console.error('Error fetching properties:', err)
      }
    }

    fetchProperties()
  }, [loaderType])

  const handleRetry = () => {
    // Reset state and trigger a new fetch
    setError(null)
    setLoadingState('idle')
    // Toggle loader type to trigger useEffect
    setLoaderType(prev => (prev === 'spinner' ? 'skeleton' : 'spinner'))
  }

  const toggleLoaderType = () => {
    setLoaderType(prev => (prev === 'spinner' ? 'skeleton' : 'spinner'))
  }

  return (
    <div className="property-listing">
      <div className="controls">
        <h1>Property Listings</h1>
        <button onClick={toggleLoaderType} className="toggle-button">
          Switch to {loaderType === 'spinner' ? 'Skeleton' : 'Spinner'} Loader
        </button>
      </div>

      {/* Spinner Loading State */}
      {loadingState === 'loading' && (
        <div className="loading-container">
          <Spinner size="large" />
          <p>Loading properties...</p>
        </div>
      )}

      {/* Skeleton Loading State */}
      {loadingState === 'skeleton' && (
        <div className="skeleton-container">
          <PropertyCardSkeleton count={3} />
        </div>
      )}

      {/* Error State */}
      {loadingState === 'error' && (
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {loadingState === 'success' && (
        <div className="properties-grid">
          {properties.map(property => (
            <div key={property.id} className="property-card">
              {property.imageUrl ? (
                <img src={property.imageUrl} alt={property.address} className="property-image" />
              ) : (
                <div className="property-image-placeholder">No image available</div>
              )}
              <h2>{property.address}</h2>
              <p className="property-price">${property.price.toLocaleString()}</p>
              <div className="property-details">
                <span>{property.bedrooms} beds</span>
                <span>{property.bathrooms} baths</span>
                <span>{property.area} sq ft</span>
              </div>
              <p className="property-type">{property.type}</p>
              <p className="property-description">{property.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Wrap with ErrorBoundary for additional safety
const PropertyListingWithLoadersWrapper: React.FC = () => (
  <ErrorBoundary>
    <PropertyListingWithLoaders />
  </ErrorBoundary>
)

export default PropertyListingWithLoadersWrapper
