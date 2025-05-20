describe('Property Search', () => {
  beforeEach(() => {
    // Intercept the API call for property search
    cy.intercept('GET', '**/api/properties*', {
      statusCode: 200,
      body: {
        properties: [
          {
            id: '1',
            title: 'Luxury Apartment in London',
            location: 'London, UK',
            price: 750000,
            bedrooms: 3,
            bathrooms: 2,
            imageUrl: '/images/property-1.jpg'
          },
          {
            id: '2',
            title: 'Cozy Cottage in Bath',
            location: 'Bath, UK',
            price: 450000,
            bedrooms: 2,
            bathrooms: 1,
            imageUrl: '/images/property-2.jpg'
          },
          {
            id: '3',
            title: 'Modern Flat in Manchester',
            location: 'Manchester, UK',
            price: 350000,
            bedrooms: 2,
            bathrooms: 1,
            imageUrl: '/images/property-3.jpg'
          }
        ],
        totalCount: 3
      }
    }).as('searchProperties')
  })

  it('should search properties by location', () => {
    cy.visit('/properties')
    
    // Enter search query
    cy.get('input[placeholder*="Search"]').type('London{enter}')
    
    // Wait for the search results
    cy.wait('@searchProperties')
    
    // Verify the URL contains the search query
    cy.url().should('include', 'query=London')
    
    // Verify the search results are displayed
    cy.contains('Showing results for: London').should('be.visible')
    cy.get('[data-testid="property-card"]').should('have.length.at.least', 1)
  })

  it('should filter properties by price range', () => {
    // Intercept with query parameters
    cy.intercept('GET', '**/api/properties?minPrice=300000&maxPrice=500000*', {
      statusCode: 200,
      body: {
        properties: [
          {
            id: '2',
            title: 'Cozy Cottage in Bath',
            location: 'Bath, UK',
            price: 450000,
            bedrooms: 2,
            bathrooms: 1,
            imageUrl: '/images/property-2.jpg'
          },
          {
            id: '3',
            title: 'Modern Flat in Manchester',
            location: 'Manchester, UK',
            price: 350000,
            bedrooms: 2,
            bathrooms: 1,
            imageUrl: '/images/property-3.jpg'
          }
        ],
        totalCount: 2
      }
    }).as('filterProperties')
    
    cy.visit('/properties')
    
    // Open filters
    cy.contains('Filters').click()
    
    // Set price range
    cy.get('[data-testid="min-price"]').select('300000')
    cy.get('[data-testid="max-price"]').select('500000')
    
    // Apply filters
    cy.get('button').contains('Apply Filters').click()
    
    // Wait for filtered results
    cy.wait('@filterProperties')
    
    // Verify the URL contains the filter parameters
    cy.url().should('include', 'minPrice=300000')
    cy.url().should('include', 'maxPrice=500000')
    
    // Verify filtered results
    cy.get('[data-testid="property-card"]').should('have.length', 2)
    cy.contains('£450,000').should('be.visible')
    cy.contains('£350,000').should('be.visible')
    cy.contains('£750,000').should('not.exist')
  })

  it('should filter properties by number of bedrooms', () => {
    // Intercept with query parameters
    cy.intercept('GET', '**/api/properties?bedrooms=3*', {
      statusCode: 200,
      body: {
        properties: [
          {
            id: '1',
            title: 'Luxury Apartment in London',
            location: 'London, UK',
            price: 750000,
            bedrooms: 3,
            bathrooms: 2,
            imageUrl: '/images/property-1.jpg'
          }
        ],
        totalCount: 1
      }
    }).as('filterByBedrooms')
    
    cy.visit('/properties')
    
    // Open filters
    cy.contains('Filters').click()
    
    // Set bedrooms
    cy.get('[data-testid="bedrooms"]').select('3')
    
    // Apply filters
    cy.get('button').contains('Apply Filters').click()
    
    // Wait for filtered results
    cy.wait('@filterByBedrooms')
    
    // Verify the URL contains the filter parameters
    cy.url().should('include', 'bedrooms=3')
    
    // Verify filtered results
    cy.get('[data-testid="property-card"]').should('have.length', 1)
    cy.contains('Luxury Apartment in London').should('be.visible')
  })

  it('should show property details when clicking on a property', () => {
    // Intercept the API call for property details
    cy.intercept('GET', '**/api/properties/1', {
      statusCode: 200,
      body: {
        property: {
          id: '1',
          title: 'Luxury Apartment in London',
          location: 'London, UK',
          price: 750000,
          bedrooms: 3,
          bathrooms: 2,
          description: 'A beautiful luxury apartment in the heart of London',
          imageUrl: '/images/property-1.jpg',
          images: ['/images/property-1.jpg', '/images/property-1-2.jpg'],
          features: ['Balcony', 'Parking', 'Garden'],
          lat: 51.5074,
          lng: -0.1278
        }
      }
    }).as('getPropertyDetails')
    
    cy.visit('/properties')
    
    // Wait for the search results
    cy.wait('@searchProperties')
    
    // Click on the first property
    cy.get('[data-testid="property-card"]').first().click()
    
    // Wait for property details to load
    cy.wait('@getPropertyDetails')
    
    // Verify we're on the property details page
    cy.url().should('include', '/properties/1')
    
    // Verify property details are displayed
    cy.contains('Luxury Apartment in London').should('be.visible')
    cy.contains('£750,000').should('be.visible')
    cy.contains('3 bedrooms').should('be.visible')
    cy.contains('2 bathrooms').should('be.visible')
    cy.contains('A beautiful luxury apartment').should('be.visible')
  })

  it('should use semantic search for similar properties', () => {
    // Intercept the API call for semantic search
    cy.intercept('GET', '**/api/properties/similar*', {
      statusCode: 200,
      body: {
        properties: [
          {
            id: '4',
            title: 'Penthouse Apartment in London',
            location: 'London, UK',
            price: 950000,
            similarity: 0.92
          },
          {
            id: '5',
            title: 'Luxury Flat in Central London',
            location: 'London, UK',
            price: 850000,
            similarity: 0.87
          }
        ]
      }
    }).as('similarProperties')
    
    cy.visit('/properties/1')
    
    // Wait for property details to load
    cy.intercept('GET', '**/api/properties/1', {
      statusCode: 200,
      body: {
        property: {
          id: '1',
          title: 'Luxury Apartment in London',
          location: 'London, UK',
          price: 750000,
          bedrooms: 3,
          bathrooms: 2,
          description: 'A beautiful luxury apartment in the heart of London',
          imageUrl: '/images/property-1.jpg'
        }
      }
    }).as('getPropertyDetails')
    
    cy.wait('@getPropertyDetails')
    
    // Click on "Similar Properties" tab or section
    cy.contains('Similar Properties').click()
    
    // Wait for similar properties to load
    cy.wait('@similarProperties')
    
    // Verify similar properties are displayed
    cy.contains('Penthouse Apartment in London').should('be.visible')
    cy.contains('Luxury Flat in Central London').should('be.visible')
  })

  it('should save search history', () => {
    cy.visit('/properties')
    
    // Perform a search
    cy.get('input[placeholder*="Search"]').type('London{enter}')
    
    // Wait for the search results
    cy.wait('@searchProperties')
    
    // Perform another search
    cy.get('input[placeholder*="Search"]').clear().type('Bath{enter}')
    
    // Wait for the search results
    cy.wait('@searchProperties')
    
    // Open search history
    cy.get('[data-testid="search-history-button"]').click()
    
    // Verify search history contains both searches
    cy.get('[data-testid="search-history"]').within(() => {
      cy.contains('London').should('be.visible')
      cy.contains('Bath').should('be.visible')
    })
    
    // Click on a history item
    cy.get('[data-testid="search-history"]').contains('London').click()
    
    // Verify the search is performed
    cy.wait('@searchProperties')
    cy.url().should('include', 'query=London')
  })

  it('should handle no results state', () => {
    // Intercept with empty results
    cy.intercept('GET', '**/api/properties*', {
      statusCode: 200,
      body: {
        properties: [],
        totalCount: 0
      }
    }).as('emptyResults')
    
    cy.visit('/properties')
    
    // Enter search query that will return no results
    cy.get('input[placeholder*="Search"]').type('NonexistentLocation{enter}')
    
    // Wait for the search results
    cy.wait('@emptyResults')
    
    // Verify no results message
    cy.contains('No properties found').should('be.visible')
    cy.contains('Try adjusting your search criteria').should('be.visible')
  })

  it('should handle API errors gracefully', () => {
    // Intercept with error
    cy.intercept('GET', '**/api/properties*', {
      statusCode: 500,
      body: {
        error: 'Internal server error'
      }
    }).as('apiError')
    
    cy.visit('/properties')
    
    // Wait for the API error
    cy.wait('@apiError')
    
    // Verify error message
    cy.contains('Error loading properties').should('be.visible')
    cy.contains('Please try again later').should('be.visible')
  })
})