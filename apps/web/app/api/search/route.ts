import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@your-org/db';
import { generateEmbedding } from '../../../../../../lib/embedding';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get embedding provider from environment variables
const embeddingProvider = process.env.EMBEDDING_PROVIDER as 'openai' | 'lmstudio' || 'lmstudio';
const embeddingModel = process.env.LLM_MODEL || 'bge-base-en';

export async function GET(request: NextRequest) {
  try {
    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    if (!query) {
      return NextResponse.json(
        { message: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Generate embedding for the search query
    const embedding = await generateEmbedding(query, {
      provider: embeddingProvider,
      model: embeddingModel
    });
    
    // Perform vector search using PostgreSQL with pgvector
    // This uses the optimized search_properties_by_vector function if it exists
    try {
      // Try to use the optimized function first (if pgvector is set up)
      const results = await db.execute(sql`
        SELECT * FROM search_properties_by_vector(${JSON.stringify(embedding)}::vector, ${limit})
      `);
      
      if (results.length > 0) {
        return NextResponse.json({
          query,
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
      .orderBy(sql`embedding <-> ${JSON.stringify(embedding)}::jsonb`)
      .limit(limit);
    
    return NextResponse.json({
      query,
      results: properties
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the search' },
      { status: 500 }
    );
  }
}