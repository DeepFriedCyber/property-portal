import { NextRequest, NextResponse } from 'next/server'

import { fetchProperties } from '@/lib/api'
import { prisma } from '@/lib/db'
import { generatePropertyEmbedding } from '@/lib/embeddings'
<<<<<<< HEAD
import { 
  withErrorHandling, 
  ValidationError,
  logger 
} from '@/lib/api'
=======
import { createPropertySchema } from '@/lib/schemas/propertySchemas'

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')

    // Fetch properties with the given parameters
    const result = await fetchProperties(query, page, limit)

    // Return the properties and pagination info
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in properties API route:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}
>>>>>>> clean-branch

/**
 * GET /api/properties
 * Fetch properties with optional filtering and pagination
 */
<<<<<<< HEAD
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Get search parameters from the URL
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '6')

  logger.info(`Fetching properties with query: "${query}", page: ${page}, limit: ${limit}`)

  // Fetch properties with the given parameters
  const result = await fetchProperties(query, page, limit)

  // Return the properties and pagination info
  return NextResponse.json(result)
})

/**
 * POST /api/properties
 * Create a new property with embedding
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Parse request body
  const body = await request.json()
  
  // Validate property data
  const validationResult = createPropertySchema.safeParse(body)
  if (!validationResult.success) {
    logger.warn('Property validation failed', { 
      errors: validationResult.error.format() 
    })
    
    throw new ValidationError(
      'Invalid property data', 
      validationResult.error.format()
    )
=======
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

    // Generate embedding for the property
    const embedding = await generatePropertyEmbedding({
      title: propertyData.title,
      location: propertyData.location,
      description: body.description || '',
    })

    // Create property with embedding
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        embedding,
        // Add any other required fields with default values if needed
        description: body.description || '',
        bedrooms: body.bedrooms || 0,
        bathrooms: body.bathrooms || 0,
        area: body.area || 0,
        address: body.address || '',
        city: body.city || '',
        images: body.images ? [body.images] : [],
        features: body.features || [],
      },
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
>>>>>>> clean-branch
  }
  
  const propertyData = validationResult.data
  
  logger.info('Creating new property', { 
    title: propertyData.title,
    location: propertyData.location 
  })
  
  // Generate embedding for the property
  const embedding = await generatePropertyEmbedding({
    title: propertyData.title,
    location: propertyData.location,
    description: body.description || '',
  })
  
  // Create property with embedding
  const property = await prisma.property.create({
    data: {
      ...propertyData,
      embedding,
      // Add any other required fields with default values if needed
      description: body.description || '',
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 0,
      area: body.area || 0,
      address: body.address || '',
      city: body.city || '',
      images: body.images ? [body.images] : [],
      features: body.features || [],
    },
  })
  
  logger.info('Property created successfully', { propertyId: property.id })
  
  return NextResponse.json({ property }, { status: 201 })
})
