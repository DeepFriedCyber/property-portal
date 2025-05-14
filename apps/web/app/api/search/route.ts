import { NextRequest } from 'next/server';
import { db } from '@your-org/db';
// Import the property table directly from the drizzle schema
import { pgTable, text, uuid, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { generateEmbedding } from '../../../../../lib/embedding';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { successResponse, errorResponse, HttpStatus } from '../../../../../lib/api/response';
import { validateQuery, withValidation } from '../../../../../lib/api/validation';
import { bindVector, bindJsonbArray } from '../../../../../lib/db/utils';

// Define the property table directly in this file to avoid import issues
const property = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadId: uuid('upload_id'),
  address: text('address'),
  price: integer('price'),
  bedrooms: integer('bedrooms'),
  type: text('type'),
  dateSold: timestamp('date_sold'),
  embedding: jsonb('embedding').$type<number[]>()
});

// Get embedding provider from environment variables
const embeddingProvider = (process.env.EMBEDDING_PROVIDER || 'lmstudio') as 'openai' | 'lmstudio';
const embeddingModel = process.env.LLM_MODEL || 'bge-base-en';

// Define the search query schema
const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.string()
    .optional()
    .transform(val => {
      const parsed = parseInt(val || '10', 10);
      return isNaN(parsed) ? 10 : parsed;
    })
});

export const GET = withValidation(async (request: NextRequest) => {
  // Validate query parameters
  const params = await validateQuery(request, SearchQuerySchema) as z.infer<typeof SearchQuerySchema>;
  
  // Generate embedding for the search query
  const embedding = await generateEmbedding(params.q, {
    provider: embeddingProvider,
    model: embeddingModel
  });
  
  // Perform vector search using PostgreSQL with pgvector
  // This uses the optimized search_properties_by_vector function if it exists
  try {
    // Try to use the optimized function first (if pgvector is set up)
    // Use proper parameter binding instead of JSON.stringify
    const { rows } = await db.execute(sql`
      SELECT * FROM search_properties_by_vector(${bindVector(embedding)}, ${params.limit})
    `);
    
    if (rows.length > 0) {
      return successResponse({
        query: params.q,
        results: rows
      });
    }
  } catch (e) {
    console.log('Optimized vector search not available, falling back to JSONB search');
  }
  
  // Fall back to JSONB-based search if the function doesn't exist
  const properties = await db.select()
    .from(property)
    .where(sql`embedding is not null`)
    .orderBy(sql`embedding <-> ${bindJsonbArray(embedding)}`)
    .limit(params.limit);
  
  return successResponse({
    query: params.q,
    results: properties
  });
});