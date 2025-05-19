import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NearbyProperties from './NearbyProperties'

// Mock the fetchNearbyProperties function
vi.mock('@/lib/api', () => ({
  fetchNearbyProperties: vi.fn(),
}))

// Mock the PropertyCard component
vi.mock('@/components/PropertyCard', () => ({
  __esModule: true,
  default: ({ property }) => (
    <div data-testid="property-card">
      <h3>{property.title}</h3>
      <p>{property.location}</p>
    </div>
  ),
}))

import { fetchNearbyProperties } from '@/lib/api'

describe('NearbyProperties', () => {
  it('renders nearby properties when available', async () => {
    // Mock the API response
    const mockNearbyProperties = [
      {
        id: '2',
        title: 'Beach House',
        location: 'Santa Monica, CA',
        price: 1200000,
      },
      {
        id: '3',
        title: 'Mountain Retreat',
        location: 'Topanga, CA',
        price: 950000,
      },
    ]
    
    // Set up the mock to return our test data
    vi.mocked(fetchNearbyProperties).mockResolvedValue(mockNearbyProperties)
    
    // Render the component
    render(
      <NearbyProperties
        propertyId="1"
        lat={34.0259}
        lng={-118.7798}
      />
    )
    
    // Check for section title
    expect(await screen.findByText('Nearby Properties')).toBeInTheDocument()
    
    // Check for property cards
    expect(await screen.findByText('Beach House')).toBeInTheDocument()
    expect(await screen.findByText('Santa Monica, CA')).toBeInTheDocument()
    expect(await screen.findByText('Mountain Retreat')).toBeInTheDocument()
    expect(await screen.findByText('Topanga, CA')).toBeInTheDocument()
    
    // Check that the API was called with correct parameters
    expect(fetchNearbyProperties).toHaveBeenCalledWith(
      '1',
      34.0259,
      -118.7798,
      20,
      3
    )
  })
  
  it('renders nothing when no nearby properties are found', async () => {
    // Mock empty response
    vi.mocked(fetchNearbyProperties).mockResolvedValue([])
    
    const { container } = render(
      <NearbyProperties
        propertyId="1"
        lat={34.0259}
        lng={-118.7798}
      />
    )
    
    // The component should return null, so the container should be empty
    expect(container.firstChild).toBeNull()
    
    // Check that the API was still called
    expect(fetchNearbyProperties).toHaveBeenCalled()
  })
})