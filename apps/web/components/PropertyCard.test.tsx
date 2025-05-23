import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { PropertyCard } from './PropertyCard'

describe('PropertyCard', () => {
  it('renders the property title and price', () => {
    // Arrange
    const title = 'Luxury Apartment'
    const price = 1500

    // Act
    render(<PropertyCard title={title} price={price} />)

    // Assert
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText('$1500/month')).toBeInTheDocument()
  })

  it('has the correct accessibility attributes', () => {
    // Arrange
    const title = 'Beach House'
    const price = 2500

    // Act
    render(<PropertyCard title={title} price={price} />)

    // Assert
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-label', `${title}, $${price} per month`)
    expect(article).toHaveAttribute('tabIndex', '0')
  })
})
