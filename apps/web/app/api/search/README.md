# Property Portal Search API

This directory contains the implementation of the semantic search API for the Property Portal application. The search API uses vector embeddings to find properties that semantically match the user's query.

## API Endpoint

`GET /api/search`

### Query Parameters

- `q` (required): The search query string
- `limit` (optional): Maximum number of results to return (default: 10)

### Response Format

```json
{
  "success": true,
  "data": {
    "query": "modern apartment",
    "results": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Modern Luxury Apartment",
        "price": 750000,
        "bedrooms": 2,
        "type": "apartment",
        "address": "123 Main St, City"
      }
    ]
  }
}
```

## Implementation Details

The search API uses a two-tier approach:

1. **Vector Search**: First attempts to use PostgreSQL's pgvector extension via a stored function (`search_properties_by_vector`) for efficient vector similarity search.

2. **Fallback Search**: If the optimized vector search is not available, falls back to a JSONB-based approach that still provides semantic search capabilities.

## Testing

The search API is thoroughly tested using Vitest. The test suite covers:

- Basic search functionality
- Vector search results
- Fallback search results
- Error handling
- Parameter validation
- Edge cases (long queries, special characters, etc.)

To run the tests:

```bash
npx vitest run apps/web/app/api/search/route.vitest.ts
```

## Dependencies

- `@your-org/db`: Database access layer
- `lib/embedding`: Vector embedding generation
- `lib/api/response`: Standardized API response utilities
- `lib/api/validation`: Request validation utilities
- `lib/db/utils`: Database utility functions

## Error Handling

The API handles various error scenarios:

- Missing or invalid query parameters (422 Unprocessable Entity)
- Database errors (500 Internal Server Error)
- Embedding generation errors (500 Internal Server Error)

## Performance Considerations

- The API uses vector embeddings for semantic search, which provides more relevant results than keyword matching
- The optimized vector search function is used when available for better performance
- Results are limited to control response size and query performance