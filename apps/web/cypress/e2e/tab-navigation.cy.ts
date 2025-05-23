describe('Tab Navigation', () => {
  it('should tab through inputs', () => {
    cy.visit('/examples/form')
    cy.get('#username').focus()
    cy.tab() // Tabs to next input
    cy.get('#password').should('be.focused')
    cy.tab() // Tabs to next input
    cy.get('#email').should('be.focused')
    cy.tab() // Tabs to submit button
    cy.focused().should('have.attr', 'type', 'submit')
  })

  it('should shift+tab backward', () => {
    cy.visit('/examples/form')
    cy.get('#password').focus()
    cy.tab({ shift: true }) // Shift+Tab
    cy.get('#username').should('be.focused')
  })

  it('should cycle through all focusable elements', () => {
    cy.visit('/examples/form')

    // Start at the first input
    cy.get('#username').focus()

    // Tab through all elements and back to the first
    cy.tab() // to password
    cy.tab() // to email
    cy.tab() // to submit button
    cy.tab() // back to username (cycle)

    cy.get('#username').should('be.focused')
  })
})
