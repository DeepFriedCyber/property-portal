-- Migration: Add embedding column to properties table
-- This migration adds a vector column to store property embeddings

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

-- Add embedding column to properties table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'embedding'
    ) THEN
        RAISE NOTICE 'Adding embedding column to properties table...';
        ALTER TABLE properties ADD COLUMN embedding vector(384);
    END IF;
END
$$;

-- Add comment to the column for documentation
COMMENT ON COLUMN properties.embedding IS 
'Vector embedding of the property for semantic search. 
Dimension: 384. Generated from property title, description, location, and type.';

-- Create a function to update property embeddings
CREATE OR REPLACE FUNCTION update_property_embedding()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder. In a real application, you would call an external service
    -- to generate embeddings based on the property data.
    -- For now, we'll just set it to NULL and let a background process handle it.
    NEW.embedding = NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update embeddings when properties are inserted or updated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'trigger_update_property_embedding'
    ) THEN
        CREATE TRIGGER trigger_update_property_embedding
        BEFORE INSERT OR UPDATE OF title, description, location, property_type
        ON properties
        FOR EACH ROW
        EXECUTE FUNCTION update_property_embedding();
    END IF;
END
$$;

-- Add comment to the trigger
COMMENT ON TRIGGER trigger_update_property_embedding ON properties IS
'Trigger to update property embeddings when relevant fields are changed.
Sets embedding to NULL to be processed by a background job.';