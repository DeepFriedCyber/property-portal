import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { generatePropertyEmbedding } from '@/lib/embeddings'
import { PropertySimilarityResult, SimilarPropertiesResponse } from '@/types/property'

// Type for vector operations
// In PostgreSQL with pgvector, embeddings are stored as vectors
// In JavaScript/TypeScript, we work with them as number arrays
type EmbeddingVector = number[]

// Type for API error responses
type ErrorResponse = {
  error: string
}

/**
 * API route to find similar properties based on text description
 * GET /api/properties/similar?query=modern+apartment+in+london&limit=3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '3')

    if (!query) {
      const errorResponse: ErrorResponse = { error: 'Query parameter is required' }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Generate embedding for the query
    const embedding = await generatePropertyEmbedding({
      title: query,
      location: '',
    })

    // Find similar properties using vector similarity
    // Note: This requires PostgreSQL with pgvector extension
    // The embedding from generatePropertyEmbedding is already a number[]
    const queryLimit = Number(limit)
    const similarProperties = await prisma.$queryRaw<PropertySimilarityResult[]>(Prisma.sql`
      SELECT 
        id, title, description, price, bedrooms, bathrooms, 
        area, location, address, lat, lng, images, features,
        councilTaxBand, epcRating, tenure, createdAt, updatedAt,
        embedding <=> ${Prisma.sql`${embedding}`}::vector AS similarity  -- Cosine similarity with pgvector
      FROM "Property"
      WHERE embedding IS NOT NULL
      ORDER BY similarity
      LIMIT ${Prisma.sql`${queryLimit}`}
    `)

    const response: SimilarPropertiesResponse = { properties: similarProperties }
    return NextResponse.json(response)
  } catch (error) {
    // This console.error is allowed by ESLint config for error logging
    console.error('Error finding similar properties:', error)
    const errorResponse: ErrorResponse = { error: 'Failed to find similar properties' }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * API route to find similar properties based on a property ID
 * POST /api/properties/similar
 * Body: { propertyId: "123", limit: 3 }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, limit = 3 } = body

    if (!propertyId) {
      const errorResponse: ErrorResponse = { error: 'Property ID is required' }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Get the reference property with embedding field explicitly selected
    const referenceProperty = (await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        embedding: true,
      },
    })) as { id: string; embedding: EmbeddingVector | null }

    if (!referenceProperty || !referenceProperty.embedding) {
      const errorResponse: ErrorResponse = { error: 'Property not found or has no embedding' }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Find similar properties using vector similarity
    // The embedding from the database is already a number[]
    const queryLimit = Number(limit)
    const similarProperties = await prisma.$queryRaw<PropertySimilarityResult[]>(Prisma.sql`
      SELECT 
        id, title, description, price, bedrooms, bathrooms, 
        area, location, address, lat, lng, images, features,
        councilTaxBand, epcRating, tenure, createdAt, updatedAt,
        embedding <=> ${Prisma.sql`${referenceProperty.embedding}`}::vector AS similarity  -- Cosine similarity with pgvector
      FROM "Property"
      WHERE id != ${Prisma.sql`${propertyId}`}
      AND embedding IS NOT NULL
      ORDER BY similarity
      LIMIT ${Prisma.sql`${queryLimit}`}
    `)

    const response: SimilarPropertiesResponse = { properties: similarProperties }
    return NextResponse.json(response)
  } catch (error) {
    // This console.error is allowed by ESLint config for error logging
    console.error('Error finding similar properties:', error)
    const errorResponse: ErrorResponse = { error: 'Failed to find similar properties' }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
