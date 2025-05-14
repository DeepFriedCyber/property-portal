import { NextRequest } from 'next/server';
import { db, schema } from '@your-org/db';
import { generateEmbedding } from '../../../../../../lib/embedding';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { successResponse, errorResponse, HttpStatus } from '../../../../../../lib/api/response';
import { validateQuery, withValidation } from '../../../../../../lib/api/validation';
import { bindVector, bindJsonbArray } from '../../../../../../lib/db/utils';

// Get embedding provider from environment variables
const embeddingProvider = process.env.EMBEDDING_PROVIDER as 'openai' | 'lmstudio' || 'lmstudio';
const embeddingModel = process.env.LLM_MODEL || 'bge-base-en';

// Define the search query schema
const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.string().optional().transform(val => parseInt(val || '10', 10))
});

export const GET = withValidation(async (request: NextRequest) => {
  // Validate query parameters
  const params = await validateQuery(request, SearchQuerySchema);
  
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
    const results = await db.execute(sql`
      SELECT * FROM search_properties_by_vector(${bindVector(embedding)}, ${params.limit})
    `);
    
    if (results.length > 0) {
      return successResponse({
        query: params.q,
        results: results
      });
    }
  } catch (e) {
    console.log('Optimized vector search not available, falling back to JSONB search');
  }
  
  // Fall back to JSONB-based search if the function doesn't exist
  const properties = await db.select()
    .from(schema.property)
    .where(sql`embedding is not null`)
    .orderBy(sql`embedding <-> ${bindJsonbArray(embedding)}`)
    .limit(params.limit);
  
  return successResponse({
    query: params.q,
    results: properties
  });
});