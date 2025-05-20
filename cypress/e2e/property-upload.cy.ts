describe('Property Upload Flow', () => {
  beforeEach(() => {
    // Mock authenticated state as an agent/admin
    cy.window().then((window) => {
      window.localStorage.setItem('auth', JSON.stringify({
        token: 'mock-token',
        user: { 
          id: '123', 
          name: 'Agent User', 
          email: 'agent@example.com',
          role: 'agent'
        }
      }))
    })
  })

  it('should navigate to add property page', () => {
    cy.visit('/agent/dashboard')
    cy.contains('Add New Property').click()
    cy.url().should('include', '/agent/properties/new')
    cy.get('h1').should('contain', 'Add New Property')
  })

  it('should validate the property form', () => {
    cy.visit('/agent/properties/new')
    
    // Submit empty form
    cy.get('button[type="submit"]').click()
    
    // Check for validation errors
    cy.contains('Title is required').should('be.visible')
    cy.contains('Price is required').should('be.visible')
    cy.contains('Address is required').should('be.visible')
  })

  it('should successfully submit a valid property', () => {
    // Intercept the API call
    cy.intercept('POST', '**/api/properties', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          id: 'new-property-123',
          title: 'Test Property',
          price: 500000
        }
      }
    }).as('createProperty')
    
    cy.visit('/agent/properties/new')
    
    // Fill in the form
    cy.get('#title').type('Test Property')
    cy.get('#price').type('500000')
    cy.get('#listingType').select('sale')
    cy.get('#propertyType').select('house')
    cy.get('#description').type('A beautiful test property')
    
    // Fill address
    cy.get('#address\\.line1').type('123 Test Street')
    cy.get('#address\\.town').type('London')
    cy.get('#address\\.postcode').type('SW1A 1AA')
    
    // Fill property details
    cy.get('#bedrooms').type('3')
    cy.get('#bathrooms').type('2')
    cy.get('#receptionRooms').type('1')
    cy.get('#squareFootage').type('1500')
    cy.get('#tenure').select('freehold')
    cy.get('#councilTaxBand').select('D')
    cy.get('#epcRating').select('C')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Wait for the API call
    cy.wait('@createProperty')
    
    // Check for success message
    cy.contains('Property added successfully').should('be.visible')
  })

  it('should handle API errors during submission', () => {
    // Intercept the API call with an error
    cy.intercept('POST', '**/api/properties', {
      statusCode: 500,
      body: {
        success: false,
        error: {
          message: 'Server error occurred'
        }
      }
    }).as('createPropertyError')
    
    cy.visit('/agent/properties/new')
    
    // Fill in minimal required fields
    cy.get('#title').type('Error Test Property')
    cy.get('#price').type('500000')
    cy.get('#address\\.line1').type('123 Test Street')
    cy.get('#address\\.town').type('London')
    cy.get('#address\\.postcode').type('SW1A 1AA')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Wait for the API call
    cy.wait('@createPropertyError')
    
    // Check for error message
    cy.contains('Failed to add property').should('be.visible')
  })

  it('should support CSV bulk upload', () => {
    // Intercept the API call
    cy.intercept('POST', '**/api/properties/bulk-upload', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          imported: 3,
          failed: 0
        }
      }
    }).as('bulkUpload')
    
    cy.visit('/agent/properties/bulk-upload')
    
    // Upload a CSV file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(`title,location,price,bedrooms,bathrooms
"Luxury Apartment","London, UK",500000,2,2
"Cozy Cottage","Bath, UK",350000,3,1
"Modern Flat","Manchester, UK",275000,1,1`),
      fileName: 'properties.csv',
      mimeType: 'text/csv'
    }, { force: true })
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Wait for the API call
    cy.wait('@bulkUpload')
    
    // Check for success message
    cy.contains('Successfully imported 3 properties').should('be.visible')
  })

  it('should validate CSV files before upload', () => {
    cy.visit('/agent/properties/bulk-upload')
    
    // Upload an invalid CSV file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(`title,location
"Luxury Apartment","London, UK"
"Cozy Cottage","Bath, UK"`),
      fileName: 'invalid.csv',
      mimeType: 'text/csv'
    }, { force: true })
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Check for validation error
    cy.contains('Missing required columns: price, bedrooms, bathrooms').should('be.visible')
  })

  it('should allow editing an existing property', () => {
    // Intercept the API call to get property
    cy.intercept('GET', '**/api/properties/123', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: '123',
          title: 'Existing Property',
          price: 400000,
          bedrooms: 2,
          bathrooms: 1,
          address: {
            line1: '123 Existing Street',
            town: 'London',
            postcode: 'SW1A 1AA'
          }
        }
      }
    }).as('getProperty')
    
    // Intercept the update API call
    cy.intercept('PUT', '**/api/properties/123', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: '123',
          title: 'Updated Property'
        }
      }
    }).as('updateProperty')
    
    cy.visit('/agent/properties/123/edit')
    
    // Wait for the property data to load
    cy.wait('@getProperty')
    
    // Check that form is pre-filled
    cy.get('#title').should('have.value', 'Existing Property')
    cy.get('#price').should('have.value', '400000')
    
    // Update the title
    cy.get('#title').clear().type('Updated Property')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Wait for the API call
    cy.wait('@updateProperty')
    
    // Check for success message
    cy.contains('Property updated successfully').should('be.visible')
  })
})