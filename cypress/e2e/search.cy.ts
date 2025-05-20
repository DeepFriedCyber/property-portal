// @ts-nocheck
describe('Search Page', () => {
  it('filters properties via search bar', () => {
    cy.visit('/search')
    cy.get('input[aria-label="Search Properties"]').type('malibu')
    cy.contains('Showing results for: malibu', { matchCase: false }).should('exist')
    cy.contains('Ocean View Villa').should('exist')
    cy.contains('Urban Apartment').should('not.exist')
  })

  it('performs semantic search', () => {
    // Intercept the search API request and return mock data
    cy.intercept('POST', '/api/search/semantic', { fixture: 'searchResults.json' }).as(
      'searchRequest'
    )

    // Visit the search page
    cy.visit('/search')

    // Type a search query
    cy.get('[data-testid="search-input"]').type('cosy flat near parks')

    // Click the search button
    cy.get('[data-testid="search-button"]').click()

    // Wait for the API request and verify the request body
    cy.wait('@searchRequest').its('request.body').should('deep.include', {
      query: 'cosy flat near parks',
    })

    // Verify that property cards are displayed
    cy.get('[data-testid="property-card"]').should('have.length.gt', 0)
  })

  it('filters search results', () => {
    // Intercept the search API request and return mock data
    cy.intercept('POST', '/api/search/semantic', { fixture: 'filteredSearchResults.json' }).as(
      'filteredSearchRequest'
    )

    // Visit the search page
    cy.visit('/search')

    // Type a search query
    cy.get('[data-testid="search-input"]').type('modern apartment')

    // Set price filter
    cy.get('[data-testid="min-price"]').type('200000')
    cy.get('[data-testid="max-price"]').type('500000')

    // Set location filter
    cy.get('[data-testid="location"]').type('London')

    // Set bedrooms filter
    cy.get('[data-testid="bedrooms"]').select('2+')

    // Click the search button
    cy.get('[data-testid="search-button"]').click()

    // Wait for the API request and verify the request body includes filters
    cy.wait('@filteredSearchRequest')
      .its('request.body')
      .should('deep.include', {
        query: 'modern apartment',
        filters: {
          minPrice: 200000,
          maxPrice: 500000,
          location: 'London',
          bedrooms: 2,
        },
      })

    // Verify that filtered property cards are displayed
    cy.get('[data-testid="property-card"]').should('have.length.gt', 0)
  })

  it('shows similar properties', () => {
    // Intercept the similar properties API request and return mock data
    cy.intercept('GET', '/api/search/similar/*', { fixture: 'similarProperties.json' }).as(
      'similarRequest'
    )

    // Visit a property detail page
    cy.visit('/properties/prop-123')

    // Wait for the similar properties request
    cy.wait('@similarRequest')

    // Verify that similar properties section is displayed
    cy.get('[data-testid="similar-properties"]').should('exist')

    // Verify that similar property cards are displayed
    cy.get('[data-testid="similar-property-card"]').should('have.length.gt', 0)
  })
})
