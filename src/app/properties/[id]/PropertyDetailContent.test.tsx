import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import PropertyDetailContent from './PropertyDetailContent'

// Mock the dynamic import for Map component
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_: unknown) => {
    const Component = () => <div data-testid="mock-map">Map Component</div>
    Component.displayName = 'MockedMap'
    return Component
  },
}))

// Mock property data
const mockProperty = {
  id: '1',
  title: 'Luxury Beachfront Villa',
  description: 'A beautiful beachfront property with stunning ocean views.',
  price: 1500000,
  bedrooms: 4,
  bathrooms: 3,
  squareFeet: 2500,
  location: 'Malibu, CA',
  postcode: '90265',
  lat: 34.0259,
  lng: -118.7798,
  imageUrl: '/images/property-1.jpg',
  councilTaxBand: 'G',
  tenure: 'Freehold',
  epcRating: 'B',
}

describe('PropertyDetailContent', () => {
  it('renders property details correctly', () => {
    render(<PropertyDetailContent property={mockProperty} />)

    // Check title and price
    expect(screen.getByText('Luxury Beachfront Villa')).toBeInTheDocument()
    expect(screen.getByText(/£1,500,000/)).toBeInTheDocument()

    // Check location
    expect(screen.getByText('Malibu, CA · 90265')).toBeInTheDocument()

    // Check description
    expect(
      screen.getByText('A beautiful beachfront property with stunning ocean views.')
    ).toBeInTheDocument()

    // Check property attributes
    expect(screen.getByText('Council Tax Band')).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.getByText('Tenure')).toBeInTheDocument()
    expect(screen.getByText('Freehold')).toBeInTheDocument()
    expect(screen.getByText('EPC Rating')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()

    // Check map
    expect(screen.getByText('Map & Location')).toBeInTheDocument()
    expect(screen.getByTestId('mock-map')).toBeInTheDocument()
  })

  it('handles missing property data gracefully', () => {
    const incompleteProperty = {
      ...mockProperty,
      postcode: null,
      councilTaxBand: null,
      tenure: null,
      epcRating: null,
    }

    render(<PropertyDetailContent property={incompleteProperty} />)

    // Check location without postcode
    expect(screen.getByText('Malibu, CA')).toBeInTheDocument()
    expect(screen.queryByText('Malibu, CA ·')).not.toBeInTheDocument()

    // Check property attributes with missing data
    expect(screen.getByText('Council Tax Band')).toBeInTheDocument()
    expect(screen.getAllByText('N/A')[0]).toBeInTheDocument()
    expect(screen.getByText('Tenure')).toBeInTheDocument()
    expect(screen.getAllByText('N/A')[1]).toBeInTheDocument()
    expect(screen.getByText('EPC Rating')).toBeInTheDocument()
    expect(screen.getAllByText('N/A')[2]).toBeInTheDocument()
  })

  it('handles missing image gracefully', () => {
    const propertyWithoutImage = {
      ...mockProperty,
      imageUrl: null,
    }

    render(<PropertyDetailContent property={propertyWithoutImage} />)

    // Check for no image message
    expect(screen.getByText('No image available')).toBeInTheDocument()
  })
})
