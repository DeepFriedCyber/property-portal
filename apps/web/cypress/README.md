# Accessibility Testing with Cypress

This directory contains automated accessibility tests using Cypress and cypress-axe.

## Overview

The accessibility tests check for common accessibility issues across different pages and viewport sizes. These tests help ensure that the application is usable by people with disabilities and complies with accessibility standards.

## Test Structure

- `e2e/accessibility.cy.ts`: Main accessibility test file that checks for accessibility violations on various pages
- `support/commands.ts`: Custom Cypress commands including keyboard navigation testing
- `support/e2e.ts`: Configuration for Cypress tests including cypress-axe setup

## Running the Tests

To run the accessibility tests:

```bash
# Run all Cypress tests
npm run cypress

# Run only accessibility tests
npm run cypress:a11y
```

## What's Being Tested

1. **WCAG Compliance**: Using cypress-axe to check for violations of accessibility guidelines
2. **Keyboard Navigation**: Testing that components are properly focusable and navigable with keyboard
3. **Responsive Accessibility**: Testing accessibility across different viewport sizes (mobile, tablet, desktop)

## Adding New Tests

To add accessibility tests for a new page:

1. Add a new describe block in `e2e/accessibility.cy.ts`
2. Visit the page and inject axe
3. Run checkA11y() to test for accessibility violations
4. Add specific tests for keyboard navigation or other accessibility features

Example:

```typescript
describe('New Page', () => {
  beforeEach(() => {
    cy.visit('/new-page')
    injectAxe()
  })

  it('has no detectable accessibility violations', () => {
    checkA11y()
  })
})
```

## Resources

- [cypress-axe documentation](https://github.com/component-driven/cypress-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Testing Library Cypress](https://testing-library.com/docs/cypress-testing-library/intro/)
