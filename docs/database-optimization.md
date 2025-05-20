# Database Optimization Guide

This document outlines the database optimizations implemented in the Property Portal project to improve performance and scalability.

## Vector Search Optimization

### HNSW Index for pgvector

We've implemented an HNSW (Hierarchical Navigable Small World) index for the vector embeddings in the `Property` table. This provides significant performance improvements over the previous IVFFlat index.

```sql
CREATE INDEX "Property_embedding_hnsw_idx" ON "Property"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

#### Benefits of HNSW over IVFFlat:

- **Better recall**: HNSW typically achieves higher recall rates than IVFFlat
- **Faster queries**: More efficient for nearest neighbor searches
- **Better scaling**: Performs well with larger datasets
- **Consistent performance**: Less variance in query times

#### Configuration Parameters:

- `m = 16`: Controls the maximum number of connections per node in the graph
- `ef_construction = 64`: Controls the size of the dynamic candidate list during index construction

You can adjust these parameters based on your specific needs:

- Higher values provide better recall but slower indexing
- Lower values provide faster indexing but potentially lower recall

## Connection Pooling for Neon Postgres

We've implemented connection pooling to improve database performance and resource utilization, especially important when using Neon Postgres.

### Implementation Details

The connection pool is configured in `lib/db.ts` using the `pg` package:

```typescript
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: POOL_SIZE, // Default: 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false, // Required for Neon Postgres
  },
})
```

### Configuration

You can configure the pool size by setting the `POOL_SIZE` environment variable. The default is 10 connections.

### Benefits

- **Reduced connection overhead**: Reuses existing connections instead of creating new ones
- **Better resource utilization**: Limits the number of concurrent connections
- **Improved performance**: Faster response times for database operations
- **Connection management**: Handles connection timeouts and errors gracefully

## Monitoring and Maintenance

### Monitoring Pool Status

You can monitor the connection pool status by checking the logs. The pool emits events when connections are established or when errors occur.

### Maintenance

Regularly check the database performance and adjust the pool size and HNSW index parameters as needed based on your application's load and performance requirements.

## Future Optimizations

Consider implementing:

1. Query caching for frequently accessed data
2. Read replicas for scaling read operations
3. Sharding for horizontal scaling as data grows
4. Materialized views for complex aggregations
