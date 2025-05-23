import { render, screen } from '@testing-library/react'
import { notFound } from 'next/navigation'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { fetchPropertyById } from '@/lib/api'

import PropertyDetailPage from './page'

// Mock the necessary dependencies
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  fetchPropertyById: vi.fn(),
}))

vi.mock('./PropertyDetailContent', () => ({
  __esModule: true,
  default: ({ property }) => <div data-testid="property-detail-content">{property.title}</div>,
}))

vi.mock('@/components/PropertyAmenities', () => ({
  __esModule: true,
  default: ({ lat, lng }) => (
    <div data-testid="property-amenities">
      Amenities at {lat}, {lng}
    </div>
  ),
}))

vi.mock('./NearbyProperties', () => ({
  __esModule: true,
  default: ({ propertyId, lat, lng }) => (
    <div data-testid="nearby-properties">
      Nearby properties for {propertyId} at {lat}, {lng}
    </div>
  ),
}))

vi.mock('@/app/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>,
}))

describe('PropertyDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders property details when property is found', async () => {
    // Mock successful API response
    vi.mocked(fetchPropertyById).mockResolvedValue({
      success: true,
      property: {
        id: '1',
        title: 'Luxury Beachfront Villa',
        location: 'Malibu, CA',
        price: 1500000,
        lat: 34.0259,
        lng: -118.7798,
      },
    })

    // Render the page component
    const page = await PropertyDetailPage({ params: { id: '1' } })
    render(page)

    // Check for back link
    expect(screen.getByText('Back to all properties')).toBeInTheDocument()

    // Check for property content
    expect(screen.getByTestId('property-detail-content')).toBeInTheDocument()
    expect(screen.getByText('Luxury Beachfront Villa')).toBeInTheDocument()

    // Check for amenities
    expect(screen.getByTestId('property-amenities')).toBeInTheDocument()
    expect(screen.getByText('Amenities at 34.0259, -118.7798')).toBeInTheDocument()

    // Check for nearby properties
    expect(screen.getByTestId('nearby-properties')).toBeInTheDocument()
    expect(screen.getByText('Nearby properties for 1 at 34.0259, -118.7798')).toBeInTheDocument()

    // Check that notFound was not called
    expect(notFound).not.toHaveBeenCalled()
  })

  it('calls notFound when property is not found', async () => {
    // Mock API response for property not found
    vi.mocked(fetchPropertyById).mockResolvedValue({
      success: false,
      property: null,
    })

    // Render the page component
    await PropertyDetailPage({ params: { id: '999' } })

    // Check that notFound was called
    expect(notFound).toHaveBeenCalled()
  })

  it('calls notFound when API returns an error', async () => {
    // Mock API response with error
    vi.mocked(fetchPropertyById).mockResolvedValue({
      success: false,
      error: 'Property not found',
      property: null,
    })

    // Render the page component
    await PropertyDetailPage({ params: { id: '999' } })

    // Check that notFound was called
    expect(notFound).toHaveBeenCalled()
  })
})
