# Vector Search Setup for Production

This document explains how to set up vector search with pgvector in your Neon PostgreSQL database for production use.

## Prerequisites

- A Neon PostgreSQL database
- Admin access to run SQL commands

## Setting Up pgvector in Neon

Neon supports the pgvector extension, which enables efficient vector similarity search. Follow these steps to set it up:

### 1. Enable the pgvector Extension

First, connect to your Neon database using the SQL Editor in the Neon dashboard or using a PostgreSQL client like psql:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run the Optimization Script

We've prepared a script that:

1. Adds a native vector column to the properties table
2. Creates an HNSW index for fast approximate nearest neighbor search
3. Sets up triggers to automatically keep the vector column in sync with the JSONB column
4. Creates a function for optimized vector search

Run the script located at `scripts/create-pgvector-index.sql` in your database.

You can do this through the Neon dashboard SQL Editor or using psql:

```bash
psql "your-neon-connection-string" -f scripts/create-pgvector-index.sql
```

### 3. Verify the Setup

After running the script, verify that everything is set up correctly:

```sql
-- Check if the vector column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'properties' AND column_name = 'embedding_vector';

-- Check if the index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'properties' AND indexname = 'properties_embedding_vector_idx';

-- Check if the function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'search_properties_by_vector';
```

## How Vector Search Works

Our implementation uses a two-tier approach:

1. **Primary Method**: Uses the native pgvector extension with an HNSW index for fast approximate nearest neighbor search
2. **Fallback Method**: If pgvector is not available, falls back to using JSONB operations (slower but works without the extension)

The search API automatically tries the optimized method first and falls back to the JSONB method if needed.

## Performance Considerations

- The HNSW index parameters (`ef_construction = 128, m = 16`) are set to balance search speed and accuracy
- For larger datasets (>100K properties), you may need to adjust these parameters
- The vector dimension is set to 1536, which is appropriate for OpenAI embeddings. If you're using a different model, adjust the dimension accordingly

## Troubleshooting

If you encounter issues with vector search:

1. **Check if pgvector is enabled**:

   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. **Check if vectors are being populated**:

   ```sql
   SELECT COUNT(*) FROM properties WHERE embedding_vector IS NOT NULL;
   ```

3. **Test the search function directly**:

   ```sql
   -- Replace with an actual embedding array of the correct dimension
   SELECT * FROM search_properties_by_vector(ARRAY[0.1, 0.2, ...], 5);
   ```

4. **Monitor query performance**:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM search_properties_by_vector(ARRAY[0.1, 0.2, ...], 5);
   ```
