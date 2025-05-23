import 'cypress-axe'

describe('Accessibility Checks', () => {
  // Test the homepage
  describe('Homepage', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.injectAxe()
    })

    it('has no detectable accessibility violations', () => {
      cy.checkA11y()
    })
  })

  // Test the accessibility examples page
  describe('Accessibility Examples Page', () => {
    beforeEach(() => {
      cy.visit('/examples/accessibility')
      cy.injectAxe()
    })

    it('has no detectable accessibility violations', () => {
      cy.checkA11y()
    })

    it('PropertyCard components are keyboard navigable', () => {
      // Tab to the first property card
      cy.get('body').tab()
      cy.get('body').tab()
      cy.get('body').tab()

      // Check that a property card receives focus
      cy.focused()
        .should('have.attr', 'role', 'article')
        .should('have.attr', 'aria-label')
        .and('include', 'per month')
    })
  })

  // Test with different viewport sizes
  describe('Responsive Accessibility', () => {
    const viewports = [
      { width: 375, height: 667, device: 'mobile' },
      { width: 768, height: 1024, device: 'tablet' },
      { width: 1280, height: 800, device: 'desktop' },
    ]

    viewports.forEach(viewport => {
      describe(`Viewport: ${viewport.device} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height)
          cy.visit('/examples/accessibility')
          cy.injectAxe()
        })

        it('has no detectable accessibility violations', () => {
          cy.checkA11y()
        })
      })
    })
  })
})
