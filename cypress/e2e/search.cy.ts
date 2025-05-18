// @ts-nocheck
describe('Search Page', () => {
  it('filters properties via search bar', () => {
    cy.visit('/search')
    cy.get('input[aria-label="Search Properties"]').type('malibu')
    cy.contains('Showing results for: malibu', { matchCase: false }).should('exist')
    cy.contains('Ocean View Villa').should('exist')
    cy.contains('Urban Apartment').should('not.exist')
  })
})
