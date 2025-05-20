# Vector Search Implementation

This document describes how vector search is implemented in the property portal application.

## Overview

We use PostgreSQL with the pgvector extension to enable similarity searches for properties. This allows us to find properties that are semantically similar based on their descriptions, titles, and other textual features.

## Technical Implementation

### Database Setup

1. **pgvector Extension**: We use the PostgreSQL pgvector extension for vector operations.

   ```sql
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```

2. **Schema**: The Property model includes an embedding field of type vector(1536).

   ```prisma
   model Property {
     // other fields...
     embedding Unsupported("vector(1536)")? // Vector embedding for similarity search
   }
   ```

3. **Indexing**: We use an IVFFlat index for faster similarity searches.
   ```sql
   CREATE INDEX "Property_embedding_idx" ON "Property" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```

### Embedding Generation

Properties are embedded using a text embedding service that converts textual descriptions into 1536-dimensional vectors. These vectors capture the semantic meaning of the property descriptions.

```typescript
// Generate embedding for a property
const embedding = await generatePropertyEmbedding({
  title: property.title,
  location: property.location,
  description: property.description,
})
```

### Similarity Search

We use the cosine similarity operator (`<=>`) to find similar properties:

```sql
SELECT
  id, title, description, price, /* other fields */,
  embedding <=> ${queryEmbedding}::vector AS similarity
FROM "Property"
WHERE embedding IS NOT NULL
ORDER BY similarity
LIMIT 5
```

## Performance Considerations

1. **Indexing**: The IVFFlat index significantly improves query performance for large datasets.
2. **Selective Field Retrieval**: We only select the fields we need rather than using `SELECT *`.
3. **Null Handling**: We filter out properties without embeddings using `WHERE embedding IS NOT NULL`.

## Future Improvements

1. **Hybrid Search**: Combine vector search with traditional text search for better results.
2. **Clustering**: Pre-cluster properties to improve search performance.
3. **Dimension Reduction**: Consider reducing vector dimensions if performance becomes an issue.

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Indexing Strategies](https://www.postgresql.org/docs/current/indexes-types.html)
