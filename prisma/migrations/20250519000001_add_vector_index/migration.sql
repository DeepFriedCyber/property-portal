-- Add an IVFFlat index for faster vector similarity searches
-- Using vector_cosine_ops since we're using cosine similarity (<=> operator)
CREATE INDEX IF NOT EXISTS "Property_embedding_idx" ON "Property" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);