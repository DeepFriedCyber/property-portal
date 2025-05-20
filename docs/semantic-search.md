# Semantic Search Implementation

This document describes the semantic search implementation for the Property Portal application.

## Overview

The semantic search feature allows users to find properties using natural language queries rather than just keyword matching. This implementation includes:

- Vector-based semantic search using pgvector
- API rate limiting to prevent abuse
- Cypress E2E tests to ensure functionality

## Components

### 1. Backend Implementation

#### Vector Search Service (`services/vectorSearch.ts`)

The core service that handles semantic property searches:

```typescript
export async function semanticPropertySearch(
  queryEmbedding: number[],
  filters: PropertySearchFilters = {},
  options: PropertySearchOptions = {}
) {
  // Implementation details...
}
```

#### Search API Routes (`apps/api/src/routes/search.ts`)

API endpoints for semantic search with rate limiting:

```typescript
router.post('/semantic', semanticSearchLimiter, async (req, res, next) => {
  // Implementation details...
});

router.get('/similar/:propertyId', similarPropertiesLimiter, async (req, res, next) => {
  // Implementation details...
});
```

### 2. Frontend Implementation

#### Semantic Search Component (`components/search/SemanticSearch.tsx`)

React component for the semantic search interface:

```tsx
const SemanticSearch: React.FC = () => {
  // Implementation details...
};
```

#### Similar Properties Component (`components/search/SimilarProperties.tsx`)

React component for displaying similar properties:

```tsx
const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ propertyId, limit = 4 }) => {
  // Implementation details...
};
```

### 3. Database Configuration

The implementation uses HNSW indexing for efficient vector search:

```sql
CREATE INDEX ON properties USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64, ef_search = 100);
```

## Rate Limiting

To prevent abuse, the API endpoints are protected with rate limiting:

```typescript
// Semantic search: 20 requests per minute
const semanticSearchLimiter = createRateLimitMiddleware({
  interval: 60 * 1000,
  maxRequests: 20,
  prefix: 'ratelimit:semantic:',
});

// Similar properties: 50 requests per minute
const similarPropertiesLimiter = createRateLimitMiddleware({
  interval: 60 * 1000,
  maxRequests: 50,
  prefix: 'ratelimit:similar:',
});
```

## Testing

### Cypress E2E Tests

The implementation includes Cypress tests to verify functionality:

```typescript
describe('Property Search', () => {
  it('performs semantic search', () => {
    cy.intercept('POST', '/api/search/semantic', { fixture: 'searchResults.json' }).as('searchRequest');
    cy.visit('/search');
    cy.get('[data-testid="search-input"]').type('cosy flat near parks');
    cy.get('[data-testid="search-button"]').click();
    cy.wait('@searchRequest').its('request.body').should('deep.include', {
      query: 'cosy flat near parks'
    });
    cy.get('[data-testid="property-card"]').should('have.length.gt', 0);
  });

  // Additional tests...
});
```

## Usage Examples

### Basic Search

```typescript
// Client-side example
const response = await fetch('/api/search/semantic', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'modern apartment with a view near downtown',
    filters: {
      minPrice: 200000,
      maxPrice: 500000,
      bedrooms: 2
    },
    options: {
      limit: 10,
      similarityThreshold: 0.7
    }
  })
});

const data = await response.json();
const properties = data.data.results;
```

### Similar Properties

```typescript
// Client-side example
const propertyId = 'prop-123';
const response = await fetch(`/api/search/similar/${propertyId}?limit=5`);
const data = await response.json();
const similarProperties = data.data.similarProperties;
```

## Performance Considerations

1. **HNSW Index Parameters**: The parameters `m = 16`, `ef_construction = 64`, and `ef_search = 100` provide a balance between search speed and accuracy.

2. **Rate Limiting**: The rate limits are set to prevent abuse while allowing legitimate use.

3. **Caching**: Consider implementing caching for common queries to improve performance.

## Future Improvements

1. **Hybrid Search**: Combine vector search with traditional text search for better results.

2. **User Feedback**: Incorporate user feedback to improve search results.

3. **Personalization**: Personalize search results based on user preferences and history.

4. **Performance Monitoring**: Add monitoring to track search performance and optimize as needed.