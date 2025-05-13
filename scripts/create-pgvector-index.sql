-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- First, convert the JSONB embedding column to a vector type
-- This assumes your embedding dimension is 1536 for OpenAI embeddings
-- or 768 for bge-base-en (adjust as needed for your model)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

-- Create a function to update the vector column from the JSONB column
CREATE OR REPLACE FUNCTION update_embedding_vectors()
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET embedding_vector = embedding::vector
  WHERE embedding IS NOT NULL AND embedding_vector IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the function to convert existing embeddings
SELECT update_embedding_vectors();

-- Create an index for approximate nearest neighbor search
-- This uses HNSW (Hierarchical Navigable Small World) index which is faster for ANN searches
CREATE INDEX IF NOT EXISTS properties_embedding_vector_idx
ON properties
USING hnsw (embedding_vector vector_cosine_ops)
WITH (ef_construction = 128, m = 16);

-- Add a trigger to automatically update the vector column when the JSONB column is updated
CREATE OR REPLACE FUNCTION update_embedding_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.embedding_vector = NEW.embedding::vector;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_embedding_vector
BEFORE INSERT OR UPDATE OF embedding ON properties
FOR EACH ROW
WHEN (NEW.embedding IS NOT NULL)
EXECUTE FUNCTION update_embedding_vector_trigger();

-- Create a function for vector similarity search
CREATE OR REPLACE FUNCTION search_properties_by_vector(search_embedding vector(1536), limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  upload_id uuid,
  address text,
  price integer,
  bedrooms integer,
  type text,
  date_sold timestamp,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.upload_id,
    p.address,
    p.price,
    p.bedrooms,
    p.type,
    p.date_sold,
    1 - (p.embedding_vector <=> search_embedding) as similarity
  FROM 
    properties p
  WHERE 
    p.embedding_vector IS NOT NULL
  ORDER BY 
    p.embedding_vector <=> search_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;