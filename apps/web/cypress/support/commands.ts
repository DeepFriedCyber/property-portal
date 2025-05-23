// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import cypress-testing-library commands
import '@testing-library/cypress/add-commands'

// Import type definitions
/// <reference types="cypress" />
/// <reference path="../cypress.d.ts" />

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Add custom tab command for keyboard navigation testing
// Type definitions are in cypress.d.ts and support/index.d.ts files
type TabOptions = Partial<{ shift: boolean; shiftKey: boolean }>

// Add the custom tab command
Cypress.Commands.add('tab', { prevSubject: ['optional'] }, (subject: any, options?: TabOptions) => {
  const opts = options || {}
  const isShiftTab = opts.shift || opts.shiftKey || false

  if (subject) {
    cy.wrap(subject).focus()
  }

  return cy.focused().then($el => {
    const focusableElements = Cypress.$(
      'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ).filter(':visible')

    const currentIndex = focusableElements.index($el)

    let nextIndex
    if (isShiftTab) {
      nextIndex = currentIndex - 1
      if (nextIndex < 0) nextIndex = focusableElements.length - 1
    } else {
      nextIndex = currentIndex + 1
      if (nextIndex >= focusableElements.length) nextIndex = 0
    }

    const nextElement = focusableElements.get(nextIndex) // Raw DOM element
    return cy.wrap(nextElement).focus() // Chainable<Element>
  })
})

// Type definitions are also in cypress.d.ts file
