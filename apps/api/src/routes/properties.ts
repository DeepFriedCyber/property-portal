// apps/api/src/routes/properties.ts
import { Router } from 'express'

import { winstonLogger as logger } from '../../../../lib/logging/winston-logger'
import {
  BadRequest,
  NotFound,
  Unauthorized,
  Forbidden,
} from '../../../../lib/middleware/errorHandler'
import { createRateLimitMiddleware } from '../../../../lib/rate-limit/factory'

const router = Router()

// Apply rate limiting to property routes
// Read operations are less intensive, so we allow more requests
const readLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  prefix: 'ratelimit:properties:read:',
})

// Write operations are more intensive and should be limited more strictly
const writeLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  prefix: 'ratelimit:properties:write:',
})

/**
 * GET /api/properties
 * Get all properties with filtering and pagination
 */
router.get('/', readLimiter, async (req, res, next) => {
  try {
    // Extract query parameters
    const { page = '1', limit = '10', minPrice, maxPrice, location, propertyType } = req.query

    // Validate pagination parameters
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    if (isNaN(pageNum) || pageNum < 1) {
      throw BadRequest('Page must be a positive number', { provided: page })
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw BadRequest('Limit must be between 1 and 100', { provided: limit })
    }

    // Build filter object
    const filter: Record<string, any> = {}

    if (minPrice) {
      const minPriceNum = parseInt(minPrice as string, 10)
      if (isNaN(minPriceNum)) {
        throw BadRequest('minPrice must be a number', { provided: minPrice })
      }
      filter.minPrice = minPriceNum
    }

    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice as string, 10)
      if (isNaN(maxPriceNum)) {
        throw BadRequest('maxPrice must be a number', { provided: maxPrice })
      }
      filter.maxPrice = maxPriceNum
    }

    if (location) {
      filter.location = location
    }

    if (propertyType) {
      filter.propertyType = propertyType
    }

    // Log the request
    logger.info('Fetching properties', {
      context: {
        filter,
        pagination: { page: pageNum, limit: limitNum },
        requestId: req.id,
      },
    })

    // Simulate fetching properties from database
    const properties = await fetchProperties(filter, { page: pageNum, limit: limitNum })

    // Return successful response
    res.json({
      success: true,
      data: {
        properties: properties.items,
        pagination: {
          total: properties.total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(properties.total / limitNum),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/properties/:id
 * Get a single property by ID
 */
router.get('/:id', readLimiter, async (req, res, next) => {
  try {
    const { id } = req.params

    // Log the request
    logger.info(`Fetching property with ID: ${id}`, {
      context: {
        propertyId: id,
        requestId: req.id,
      },
    })

    // Simulate fetching property from database
    const property = await fetchPropertyById(id)

    // Handle not found case
    if (!property) {
      throw NotFound(`Property with ID ${id} not found`)
    }

    // Return successful response
    res.json({
      success: true,
      data: property,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/properties
 * Create a new property
 */
router.post('/', writeLimiter, async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required to create a property')
    }

    // Extract property data from request body
    const { title, description, price, location, bedrooms, bathrooms, squareFeet } = req.body

    // Validate required fields
    if (!title) {
      throw BadRequest('Title is required')
    }

    if (!price || isNaN(price) || price <= 0) {
      throw BadRequest('Valid price is required', {
        providedPrice: price,
        message: 'Price must be a positive number',
      })
    }

    if (!location) {
      throw BadRequest('Location is required')
    }

    // Create property object
    const propertyData = {
      title,
      description,
      price: Number(price),
      location,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      squareFeet: squareFeet ? Number(squareFeet) : undefined,
      createdBy: req.user.id,
    }

    // Log the creation attempt
    logger.info('Creating new property', {
      context: {
        propertyData: { ...propertyData, description: undefined }, // Don't log full description
        userId: req.user.id,
        requestId: req.id,
      },
    })

    // Simulate creating property in database
    const newProperty = await createProperty(propertyData)

    // Return successful response
    res.status(201).json({
      success: true,
      data: newProperty,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/properties/:id
 * Update an existing property
 */
router.put('/:id', writeLimiter, async (req, res, next) => {
  try {
    const { id } = req.params

    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required to update a property')
    }

    // Fetch existing property
    const existingProperty = await fetchPropertyById(id)

    // Handle not found case
    if (!existingProperty) {
      throw NotFound(`Property with ID ${id} not found`)
    }

    // Check authorization (only creator or admin can update)
    if (existingProperty.createdBy !== req.user.id && req.user.role !== 'admin') {
      throw Forbidden('You do not have permission to update this property')
    }

    // Extract property data from request body
    const { title, description, price, location, bedrooms, bathrooms, squareFeet, status } =
      req.body

    // Create update object with only provided fields
    const updateData: Record<string, any> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) {
      if (isNaN(price) || price <= 0) {
        throw BadRequest('Valid price is required', {
          providedPrice: price,
          message: 'Price must be a positive number',
        })
      }
      updateData.price = Number(price)
    }
    if (location !== undefined) updateData.location = location
    if (bedrooms !== undefined) updateData.bedrooms = Number(bedrooms)
    if (bathrooms !== undefined) updateData.bathrooms = Number(bathrooms)
    if (squareFeet !== undefined) updateData.squareFeet = Number(squareFeet)
    if (status !== undefined) updateData.status = status

    // Add audit fields
    updateData.updatedBy = req.user.id
    updateData.updatedAt = new Date()

    // Log the update attempt
    logger.info(`Updating property with ID: ${id}`, {
      context: {
        propertyId: id,
        updateData: { ...updateData, description: undefined }, // Don't log full description
        userId: req.user.id,
        requestId: req.id,
      },
    })

    // Simulate updating property in database
    const updatedProperty = await updateProperty(id, updateData)

    // Return successful response
    res.json({
      success: true,
      data: updatedProperty,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/properties/:id
 * Delete a property
 */
router.delete('/:id', writeLimiter, async (req, res, next) => {
  try {
    const { id } = req.params

    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required to delete a property')
    }

    // Fetch existing property
    const existingProperty = await fetchPropertyById(id)

    // Handle not found case
    if (!existingProperty) {
      throw NotFound(`Property with ID ${id} not found`)
    }

    // Check authorization (only creator or admin can delete)
    if (existingProperty.createdBy !== req.user.id && req.user.role !== 'admin') {
      throw Forbidden('You do not have permission to delete this property')
    }

    // Log the deletion attempt
    logger.info(`Deleting property with ID: ${id}`, {
      context: {
        propertyId: id,
        userId: req.user.id,
        requestId: req.id,
      },
    })

    // Simulate deleting property from database
    await deleteProperty(id)

    // Return successful response
    res.json({
      success: true,
      message: `Property with ID ${id} has been deleted`,
    })
  } catch (error) {
    next(error)
  }
})

// Export router
export default router

// Mock functions to simulate database operations
// In a real application, these would be imported from a service layer

async function fetchProperties(
  filter: Record<string, any>,
  pagination: { page: number; limit: number }
): Promise<{ items: any[]; total: number }> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Mock properties
  const mockProperties = Array.from({ length: 50 }, (_, i) => ({
    id: `prop-${i + 1}`,
    title: `Property ${i + 1}`,
    description: `Description for property ${i + 1}`,
    price: 100000 + i * 50000,
    location: i % 3 === 0 ? 'London, UK' : i % 3 === 1 ? 'Manchester, UK' : 'Birmingham, UK',
    bedrooms: (i % 4) + 1,
    bathrooms: (i % 3) + 1,
    squareFeet: 800 + i * 100,
    createdAt: new Date().toISOString(),
    createdBy: 'user-1',
  }))

  // Apply filters
  let filtered = [...mockProperties]

  if (filter.minPrice) {
    filtered = filtered.filter(p => p.price >= filter.minPrice)
  }

  if (filter.maxPrice) {
    filtered = filtered.filter(p => p.price <= filter.maxPrice)
  }

  if (filter.location) {
    filtered = filtered.filter(p =>
      p.location.toLowerCase().includes(filter.location.toLowerCase())
    )
  }

  if (filter.propertyType) {
    // In a real app, properties would have a type field
    filtered = filtered.filter(p => p.id.includes(filter.propertyType))
  }

  // Apply pagination
  const { page, limit } = pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  return {
    items: filtered.slice(startIndex, endIndex),
    total: filtered.length,
  }
}

async function fetchPropertyById(id: string): Promise<any | null> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 50))

  // Simulate not found for specific IDs
  if (id === 'not-found' || id === '404') {
    return null
  }

  // Return mock property data
  return {
    id,
    title: `Property ${id}`,
    description: `This is a detailed description for property ${id}...`,
    price: 250000,
    location: 'London, UK',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1500,
    createdAt: new Date().toISOString(),
    createdBy: id.includes('user2') ? 'user-2' : 'user-1',
  }
}

async function createProperty(data: Record<string, any>): Promise<any> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 150))

  // Generate ID
  const id = `prop-${Date.now()}`

  // Return created property
  return {
    id,
    ...data,
    createdAt: new Date().toISOString(),
  }
}

async function updateProperty(id: string, data: Record<string, any>): Promise<any> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Get existing property
  const existing = await fetchPropertyById(id)

  // Return updated property
  return {
    ...existing,
    ...data,
    id, // Ensure ID doesn't change
  }
}

async function deleteProperty(id: string): Promise<void> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 75))

  // In a real app, this would delete from the database
  return
}
