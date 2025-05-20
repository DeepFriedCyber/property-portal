# Vector Search Implementation

This document describes the vector search implementation for the Property Portal application.

## Overview

Vector search enables semantic search capabilities, allowing users to find properties based on natural language queries and similarity rather than just keyword matching. This implementation uses:

- **pgvector**: PostgreSQL extension for vector similarity search
- **HNSW indexing**: Hierarchical Navigable Small World algorithm for efficient approximate nearest neighbor search
- **Embeddings**: Vector representations of properties and search queries

## Components

### 1. Database Migration

The `20240601_add_hnsw_index.sql` migration adds an HNSW index to the properties table for efficient vector search:

```sql
CREATE INDEX IF NOT EXISTS idx_properties_embedding_hnsw
ON properties
USING hnsw (embedding vector_cosine_ops)
WITH (
    m = 16,              -- Maximum number of connections per node
    ef_construction = 64, -- Size of dynamic candidate list during construction
    ef_search = 100       -- Size of dynamic candidate list during search
);
```

### 2. Vector Search Service

The `vectorSearch.ts` service provides:

- **semanticPropertySearch**: Search properties using vector similarity with filters
- **getSimilarProperties**: Find properties similar to a reference property
- **generateEmbeddings**: Generate vector embeddings for text queries

### 3. Search API Routes

The `/api/search` routes expose the vector search functionality:

- **POST /api/search/semantic**: Perform a semantic search with filters
- **GET /api/search/similar/:propertyId**: Find properties similar to a reference property

## HNSW Index Parameters

The HNSW index is configured with the following parameters:

- **m = 16**: Maximum number of connections per node. Higher values improve recall but increase memory usage.
- **ef_construction = 64**: Size of the dynamic candidate list during index construction. Higher values improve recall but slow down index building.
- **ef_search = 100**: Size of the dynamic candidate list during search. Higher values improve recall but slow down search queries.

## Usage Examples

### Semantic Search

```javascript
// Client-side example
const response = await fetch('/api/search/semantic', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'modern apartment with a view near downtown',
    filters: {
      minPrice: 200000,
      maxPrice: 500000,
      bedrooms: 2,
    },
    options: {
      limit: 10,
      similarityThreshold: 0.7,
    },
  }),
})

const data = await response.json()
const properties = data.data.results
```

### Similar Properties

```javascript
// Client-side example
const propertyId = '123'
const response = await fetch(`/api/search/similar/${propertyId}?limit=5`)
const data = await response.json()
const similarProperties = data.data.similarProperties
```

## Performance Considerations

1. **Index Size**: The HNSW index can be memory-intensive. Monitor memory usage on your database server.

2. **Query Performance**: The `ef_search` parameter controls the trade-off between search speed and recall. Adjust based on your requirements.

3. **Embedding Generation**: Generating embeddings can be computationally expensive. Consider:

   - Generating embeddings asynchronously
   - Caching embeddings for common queries
   - Using a dedicated service for embedding generation

4. **Index Maintenance**: For large datasets with frequent updates, periodically refresh the index:
   ```sql
   SELECT refresh_properties_hnsw_index();
   ```

## Implementation Details

### Database Schema

The properties table requires an `embedding` column of type `vector`:

```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS embedding vector(384);
```

### Embedding Generation

For production use, replace the placeholder `generateEmbeddings` function with a call to an embedding service like OpenAI or Cohere:

```typescript
async function generateEmbeddings(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}
```

## Next Steps

1. **Implement Embedding Service**: Replace the placeholder embedding generation with a production-ready service.

2. **Add Caching**: Cache embeddings for common queries to improve performance.

3. **Optimize Index Parameters**: Fine-tune the HNSW index parameters based on your dataset and performance requirements.

4. **Add Monitoring**: Monitor query performance and index size to ensure optimal operation.

5. **Implement Hybrid Search**: Combine vector search with traditional text search for better results.
