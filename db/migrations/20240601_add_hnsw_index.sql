-- Migration: Add HNSW index for vector search optimization
-- This migration adds a Hierarchical Navigable Small World (HNSW) index to the properties table
-- for efficient approximate nearest neighbor search on property embeddings.

-- Check if pgvector extension is installed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) THEN
        RAISE NOTICE 'Installing pgvector extension...';
        CREATE EXTENSION vector;
    END IF;
END
$$;

-- Create HNSW index on the embedding column
-- Parameters:
-- - m: maximum number of connections per node (higher = better recall, more memory)
-- - ef_construction: size of the dynamic candidate list during index construction (higher = better recall, slower build)
-- - ef_search: size of the dynamic candidate list during search (higher = better recall, slower search)
CREATE INDEX IF NOT EXISTS idx_properties_embedding_hnsw 
ON properties 
USING hnsw (embedding vector_cosine_ops) 
WITH (
    m = 16,              -- Default is 16
    ef_construction = 64, -- Default is 64
    ef_search = 100       -- Default is 40
);

-- Add comment to the index for documentation
COMMENT ON INDEX idx_properties_embedding_hnsw IS 
'HNSW index for fast approximate nearest neighbor search on property embeddings. 
Parameters: m=16, ef_construction=64, ef_search=100.
This index optimizes semantic similarity searches with cosine distance.';

-- Create a function to refresh the index (can be called periodically)
CREATE OR REPLACE FUNCTION refresh_properties_hnsw_index()
RETURNS void AS $$
BEGIN
    REINDEX INDEX idx_properties_embedding_hnsw;
    RAISE NOTICE 'HNSW index on properties.embedding has been refreshed';
END;
$$ LANGUAGE plpgsql;

-- Add comment to the function
COMMENT ON FUNCTION refresh_properties_hnsw_index() IS
'Refreshes the HNSW index on properties.embedding. 
Call this function periodically if you have a large number of updates to the properties table.';