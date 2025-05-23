-- Drop the existing IVFFlat index
DROP INDEX IF EXISTS "Property_embedding_idx";

-- Create a new HNSW index for better performance with vector similarity searches
-- HNSW (Hierarchical Navigable Small World) provides faster search with better recall
CREATE INDEX IF NOT EXISTS "Property_embedding_hnsw_idx" ON "Property" 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Add a comment explaining the index
COMMENT ON INDEX "Property_embedding_hnsw_idx" IS 'HNSW index for faster vector similarity searches with better recall than IVFFlat';