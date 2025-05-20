'use server'

// External imports
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Internal imports
import { prisma } from '@/lib/db'
import { createPropertySchema, updatePropertySchema } from '@/lib/schemas/propertySchemas'
import { Property } from '@/types/property'

/**
 * Add a new property listing
 */
export async function addProperty(formData: FormData | z.infer<typeof createPropertySchema>) {
  try {
    // Handle both FormData and direct object input
    const rawData = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

    // Parse and validate the input data
    const validationResult = createPropertySchema.safeParse(rawData)

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: 'Validation error',
          details: validationResult.error.flatten().fieldErrors,
        },
      }
    }

    const validatedData = validationResult.data

    // Create the property in the database
    const property = await prisma.property.create({
      data: {
        address: validatedData.address.line1,
        city: validatedData.address.town,
        state: validatedData.address.county || '',
        zipCode: validatedData.address.postcode,
        country: 'United Kingdom',
        price: validatedData.price,
        bedrooms: validatedData.bedrooms || 0,
        bathrooms: validatedData.bathrooms || 0,
        squareFeet: validatedData.squareFootage || 0,
        description: validatedData.description || '',
        features: validatedData.features || [],
        status: validatedData.status,
        type: validatedData.propertyType,
        metadata: {
          title: validatedData.title,
          listingType: validatedData.listingType,
          addressLine2: validatedData.address.line2,
          tenure: validatedData.tenure,
          councilTaxBand: validatedData.councilTaxBand,
          epcRating: validatedData.epcRating,
          furnishingType: validatedData.furnishingType,
          availableFrom: validatedData.availableFrom,
          minimumTenancy: validatedData.minimumTenancy,
          receptionRooms: validatedData.receptionRooms,
          mainImageUrl: validatedData.mainImageUrl,
          imageUrls: validatedData.imageUrls,
        },
        createdBy: 'system', // This would typically come from the authenticated user
      },
    })

    // Revalidate the properties list page and the new property's detail page
    revalidatePath('/properties')
    revalidatePath(`/properties/${property.id}`)

    return {
      success: true,
      data: property,
    }
  } catch (error) {
    // Log the error with proper error handling
    console.error('Error adding property:', error instanceof Error ? error.message : String(error))
    return {
      success: false,
      error: {
        message: 'Failed to add property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(
  id: string,
  formData: FormData | z.infer<typeof updatePropertySchema>
) {
  try {
    // Handle both FormData and direct object input
    const rawData = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

    // Parse and validate the input data
    const validationResult = updatePropertySchema.safeParse(rawData)

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: 'Validation error',
          details: validationResult.error.flatten().fieldErrors,
        },
      }
    }

    const validatedData = validationResult.data

    // Prepare the update data
    const updateData: Partial<{
      address: string
      city: string
      state: string
      zipCode: string
      price: number
      bedrooms: number
      bathrooms: number
      squareFeet: number
      description: string
      features: string[]
      status: string
      type: string
      metadata: Record<string, any>
      updatedBy: string
      updatedAt: Date
    }> = {}

    // Map the validated data to the database schema
    if (validatedData.address?.line1) updateData.address = validatedData.address.line1
    if (validatedData.address?.town) updateData.city = validatedData.address.town
    if (validatedData.address?.county) updateData.state = validatedData.address.county
    if (validatedData.address?.postcode) updateData.zipCode = validatedData.address.postcode
    if (validatedData.price) updateData.price = validatedData.price
    if (validatedData.bedrooms !== undefined) updateData.bedrooms = validatedData.bedrooms
    if (validatedData.bathrooms !== undefined) updateData.bathrooms = validatedData.bathrooms
    if (validatedData.squareFootage) updateData.squareFeet = validatedData.squareFootage
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.features) updateData.features = validatedData.features
    if (validatedData.status) updateData.status = validatedData.status
    if (validatedData.propertyType) updateData.type = validatedData.propertyType

    // Prepare metadata updates
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: { metadata: true },
    })

    const currentMetadata = existingProperty?.metadata || {}
    const metadataUpdates: Record<
      string,
      string | number | boolean | Date | string[] | null | undefined
    > = {}

    if (validatedData.title) metadataUpdates.title = validatedData.title
    if (validatedData.listingType) metadataUpdates.listingType = validatedData.listingType
    if (validatedData.address?.line2 !== undefined)
      metadataUpdates.addressLine2 = validatedData.address.line2
    if (validatedData.tenure) metadataUpdates.tenure = validatedData.tenure
    if (validatedData.councilTaxBand) metadataUpdates.councilTaxBand = validatedData.councilTaxBand
    if (validatedData.epcRating) metadataUpdates.epcRating = validatedData.epcRating
    if (validatedData.furnishingType) metadataUpdates.furnishingType = validatedData.furnishingType
    if (validatedData.availableFrom) metadataUpdates.availableFrom = validatedData.availableFrom
    if (validatedData.minimumTenancy !== undefined)
      metadataUpdates.minimumTenancy = validatedData.minimumTenancy
    if (validatedData.receptionRooms !== undefined)
      metadataUpdates.receptionRooms = validatedData.receptionRooms
    if (validatedData.mainImageUrl) metadataUpdates.mainImageUrl = validatedData.mainImageUrl
    if (validatedData.imageUrls) metadataUpdates.imageUrls = validatedData.imageUrls

    // Only update metadata if there are changes
    if (Object.keys(metadataUpdates).length > 0) {
      updateData.metadata = {
        ...currentMetadata,
        ...metadataUpdates,
      }
    }

    // Add updatedBy and updatedAt
    updateData.updatedBy = 'system' // This would typically come from the authenticated user
    updateData.updatedAt = new Date()

    // Update the property
    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    })

    // Revalidate the properties list page and the property's detail page
    revalidatePath('/properties')
    revalidatePath(`/properties/${id}`)

    return {
      success: true,
      data: property,
    }
  } catch (error) {
    // Log the error with proper error handling
    console.error(
      'Error updating property:',
      error instanceof Error ? error.message : String(error)
    )
    return {
      success: false,
      error: {
        message: 'Failed to update property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string) {
  try {
    await prisma.property.delete({
      where: { id },
    })

    // Revalidate the properties list page
    revalidatePath('/properties')

    return {
      success: true,
    }
  } catch (error) {
    // Log the error with proper error handling
    console.error(
      'Error deleting property:',
      error instanceof Error ? error.message : String(error)
    )
    return {
      success: false,
      error: {
        message: 'Failed to delete property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Get a property by ID
 */
export async function getProperty(id: string): Promise<{
  success: boolean
  data?: Property
  error?: {
    message: string
    details?: string
  }
}> {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return {
        success: false,
        error: {
          message: 'Property not found',
        },
      }
    }

    // Convert the database model to the Property type
    const typedProperty: Property = {
      id: property.id,
      title: property.metadata?.title || property.address,
      location: `${property.address}, ${property.city}, ${property.state}`,
      price: property.price,
      imageUrl: property.metadata?.mainImageUrl || 'https://placehold.co/600x400/png?text=Property',
      lat: property.latitude || 51.505,
      lng: property.longitude || -0.09,
    }

    return {
      success: true,
      data: typedProperty,
    }
  } catch (error) {
    // Log the error with proper error handling
    console.error(
      'Error fetching property:',
      error instanceof Error ? error.message : String(error)
    )
    return {
      success: false,
      error: {
        message: 'Failed to fetch property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

/**
 * Get all properties with optional filtering
 */
export async function getProperties(options?: {
  listingType?: 'sale' | 'rent'
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  propertyType?: string
  location?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<{
  success: boolean
  data?: {
    properties: Property[]
    totalCount: number
  }
  error?: {
    message: string
    details?: string
  }
}> {
  try {
    const where: Record<string, unknown> = {}

    // Apply filters
    if (options?.listingType) {
      where.metadata = {
        path: ['listingType'],
        equals: options.listingType,
      }
    }

    if (options?.minPrice) {
      where.price = {
        ...where.price,
        gte: options.minPrice,
      }
    }

    if (options?.maxPrice) {
      where.price = {
        ...where.price,
        lte: options.maxPrice,
      }
    }

    if (options?.bedrooms) {
      where.bedrooms = {
        gte: options.bedrooms,
      }
    }

    if (options?.propertyType) {
      where.type = options.propertyType
    }

    if (options?.location) {
      where.OR = [
        { address: { contains: options.location, mode: 'insensitive' } },
        { city: { contains: options.location, mode: 'insensitive' } },
        { state: { contains: options.location, mode: 'insensitive' } },
        { zipCode: { contains: options.location, mode: 'insensitive' } },
      ]
    }

    if (options?.status) {
      where.status = options.status
    }

    // Get total count for pagination
    const totalCount = await prisma.property.count({ where })

    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      take: options?.limit || 10,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
    })

    // Convert the database models to the Property type
    const typedProperties: Property[] = properties.map(property => ({
      id: property.id,
      title: property.metadata?.title || property.address,
      location: `${property.address}, ${property.city}, ${property.state}`,
      price: property.price,
      imageUrl: property.metadata?.mainImageUrl || 'https://placehold.co/600x400/png?text=Property',
      lat: property.latitude || 51.505,
      lng: property.longitude || -0.09,
    }))

    return {
      success: true,
      data: {
        properties: typedProperties,
        totalCount,
      },
    }
  } catch (error) {
    // Log the error with proper error handling
    console.error(
      'Error fetching properties:',
      error instanceof Error ? error.message : String(error)
    )
    return {
      success: false,
      error: {
        message: 'Failed to fetch properties',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}
