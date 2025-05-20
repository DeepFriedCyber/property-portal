describe('Property Search', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.intercept('GET', '/api/properties', {
      fixture: 'properties.json',
    })
  })

  it('filters properties by location', () => {
    cy.get('input[aria-label="Search properties"]').type('Miami')
    cy.get('.property-card').should('have.length', 1)
    cy.contains('Luxury Villa')
  })
})
