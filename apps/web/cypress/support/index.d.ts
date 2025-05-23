/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Simulates tabbing behavior with optional shift for backward navigation.
     * @example cy.tab()
     * @example cy.tab({ shift: true }) // Shift+Tab
     */
    tab(options?: TabOptions): Chainable<Element>
  }
}

type TabOptions = Partial<{ shift: boolean; shiftKey: boolean }>

// Ensure this file is treated as a module
export {}
