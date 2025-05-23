-- This migration script sets up the pgvector extension and creates an optimized index
-- Run this after your Prisma migrations

-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create an optimized IVFFlat index for the embedding column
-- This index type is much faster for similarity searches than the default index
DROP INDEX IF EXISTS "Property_embedding_idx";
CREATE INDEX "Property_embedding_idx" ON "Property" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Note: The 'lists' parameter should be adjusted based on your data size
-- A good rule of thumb is sqrt(n)/2 where n is the number of rows
-- For larger datasets, you might want to increase this value