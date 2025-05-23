import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { generatePropertyEmbedding } from '@/lib/embeddings'
import { createPropertySchema } from '@/lib/schemas/propertySchemas'

/**
 * API route to generate embeddings for a property
 * POST /api/embeddings
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate property data
    const validationResult = createPropertySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid property data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const propertyData = validationResult.data

    // Generate embedding
    const embedding = await generatePropertyEmbedding({
      title: propertyData.title,
      location: propertyData.location,
      description: body.description || '',
    })

    // Return the embedding
    return NextResponse.json({ embedding })
  } catch (error) {
    console.error('Error generating embedding:', error)
    return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 })
  }
}
