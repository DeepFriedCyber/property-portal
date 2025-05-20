# Property Portal Services

This directory contains service modules that provide core functionality for the Property Portal application.

## Vector Search Service

The `vectorSearch.ts` service provides semantic search capabilities using vector embeddings and the pgvector PostgreSQL extension.

### Features

- **Semantic Property Search**: Find properties based on natural language queries
- **Similar Properties**: Find properties similar to a reference property
- **Embedding Generation**: Generate vector embeddings for text queries

### Usage

```typescript
import vectorSearchService from '../services/vectorSearch'

// Semantic search
const embeddings = await vectorSearchService.generateEmbeddings(
  'modern apartment with a view near downtown'
)

const properties = await vectorSearchService.semanticPropertySearch(
  embeddings,
  {
    minPrice: 200000,
    maxPrice: 500000,
    bedrooms: 2,
  },
  {
    limit: 10,
    similarityThreshold: 0.7,
  }
)

// Similar properties
const similarProperties = await vectorSearchService.getSimilarProperties('property-123', 5)
```

### Configuration

The vector search service requires:

1. PostgreSQL with the pgvector extension installed
2. A `properties` table with an `embedding` column of type `vector(384)`
3. An HNSW index on the `embedding` column for efficient search

See the database migrations in `db/migrations/` for setup details.

### Performance Optimization

The service uses HNSW (Hierarchical Navigable Small World) indexing for efficient approximate nearest neighbor search. The index is configured with:

- `m = 16`: Maximum number of connections per node
- `ef_construction = 64`: Size of dynamic candidate list during construction
- `ef_search = 100`: Size of dynamic candidate list during search

These parameters can be adjusted based on your specific requirements for search speed vs. accuracy.

## Implementation Notes

### Embedding Generation

The current implementation uses a placeholder for embedding generation. In a production environment, you should replace this with a call to an embedding service like OpenAI or Cohere.

Example with OpenAI:

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

### Database Connection

The service uses a connection pool for efficient database access. The pool is configured with:

- `max: 20`: Maximum number of clients in the pool
- `idleTimeoutMillis: 30000`: How long a client is allowed to remain idle
- `connectionTimeoutMillis: 2000`: How long to wait for a connection

Adjust these values based on your application's needs and database server capacity.
