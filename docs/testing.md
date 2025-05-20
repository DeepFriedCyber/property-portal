# ✅ Testing Strategy

This repo uses **Vitest** for unit testing and **Cypress** for end-to-end testing.

## Commands

```bash
# Unit Tests (Vitest)
npm test         # Run all unit tests
npm test:watch   # Live mode
npm coverage     # Coverage report

# End-to-End Tests (Cypress)
npm run cypress         # Open Cypress test runner
npm run cypress:run     # Run all E2E tests headlessly
```

## Unit Tests

Unit tests are written using Vitest and focus on testing individual functions and components in isolation.

### Best Practices

- Use `.test.ts[x]` file suffix
- Tests live beside code or in `__tests__`
- Write unit tests for utils, components, services
- Use `describe` and `it/test` blocks clearly

### Key Unit Test Areas

1. **Vector Search Logic**
   - Tests for pgvector queries and similarity search functionality
   - File: `src/lib/vector-search.test.ts`

2. **CSV Import Validation**
   - Tests for CSV parsing and validation logic
   - File: `src/lib/csv-import.test.ts`

3. **Embeddings Generation**
   - Tests for text embedding generation and similarity calculations
   - File: `src/lib/embeddings.test.ts`

4. **Search Store**
   - Tests for search history management
   - File: `src/store/searchStore.test.ts`

5. **API Routes**
   - Tests for API route handlers
   - Example: `src/app/api/properties/similar/route.test.ts`

## End-to-End Tests

End-to-end tests are written using Cypress and test the application from a user's perspective.

### Key E2E Test Areas

1. **Authentication Flows**
   - Tests for sign-in, sign-up, password reset, and sign-out
   - File: `cypress/e2e/auth-flow.cy.ts`

2. **Property Search**
   - Tests for searching, filtering, and viewing properties
   - File: `cypress/e2e/property-search.cy.ts`

3. **Property Upload**
   - Tests for adding, editing, and bulk uploading properties
   - File: `cypress/e2e/property-upload.cy.ts`

4. **Property Detail**
   - Tests for property detail page functionality
   - File: `cypress/e2e/property-detail.cy.ts`

## Test Coverage

The goal is to maintain at least 80% test coverage for critical application features:

- Authentication and authorization
- Property search and filtering
- Property creation and management
- Vector similarity search

## Mocking Strategies

1. **API Mocking**
   - Unit tests use Vitest's mocking capabilities
   - E2E tests use Cypress's `cy.intercept()` to mock API responses

2. **Authentication Mocking**
   - E2E tests set localStorage values to simulate authenticated state

3. **Database Mocking**
   - Unit tests mock Prisma client methods

## Continuous Integration

Tests are automatically run in the CI pipeline:

1. Unit tests run on every pull request and push to main
2. E2E tests run on pull requests to main and before deployment
