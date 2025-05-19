// @ts-nocheck
describe('Property Detail Page', () => {
  // Test valid property detail page
  it('displays property details correctly', () => {
    // Visit a known property ID
    cy.visit('/properties/1')
    
    // Check that the page loads with the correct title
    cy.get('h1').should('exist')
    
    // Check for essential property information
    cy.contains('Back to all properties').should('exist')
    cy.get('img').should('be.visible') // Property image
    cy.contains('$').should('exist') // Price
    
    // Check for property attributes
    cy.contains('Council Tax Band').should('exist')
    cy.contains('Tenure').should('exist')
    cy.contains('EPC Rating').should('exist')
    
    // Check for map
    cy.get('[aria-label="Map"]').should('exist')
    
    // Check for nearby amenities
    cy.contains('Nearby Amenities').should('exist')
    
    // Check for nearby properties (might not always exist)
    cy.contains('Nearby Properties').should('exist')
  })

  // Test property not found
  it('shows not found page for invalid property ID', () => {
    cy.visit('/properties/999999', { failOnStatusCode: false })
    cy.contains('Property Not Found').should('exist')
    cy.contains('Back to Properties').should('exist')
  })

  // Test navigation from property card
  it('navigates from property card to detail page', () => {
    // Start at the search page
    cy.visit('/properties')
    
    // Click on the first property card
    cy.get('article').first().within(() => {
      cy.contains('View Details').click()
    })
    
    // Verify we're on a property detail page
    cy.url().should('include', '/properties/')
    cy.get('h1').should('exist')
  })

  // Test back button functionality
  it('navigates back to properties list', () => {
    cy.visit('/properties/1')
    cy.contains('Back to all properties').click()
    cy.url().should('include', '/properties')
    cy.url().should('not.include', '/properties/1')
  })

  // Test loading state
  it('shows loading state before content loads', () => {
    // Intercept API calls to delay response
    cy.intercept('GET', '**/api/properties/**', (req) => {
      req.on('response', (res) => {
        // Delay the response to ensure loading state is visible
        res.setDelay(1000)
      })
    }).as('propertyData')
    
    cy.visit('/properties/1')
    
    // Check for loading skeleton
    cy.get('.animate-pulse').should('exist')
    
    // Wait for data to load
    cy.wait('@propertyData')
    
    // Verify loading state is gone
    cy.get('h1').should('exist')
    cy.get('.animate-pulse').should('not.exist')
  })

  // Test redirect from old route
  it('redirects from old route to new route', () => {
    cy.visit('/1')
    cy.url().should('include', '/properties/1')
  })
})