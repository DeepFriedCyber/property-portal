// This script tests the API functions directly
import { Property } from '@prisma/client'

import { prisma } from '../lib/db.js'

// Copy of the API functions to avoid module resolution issues
async function fetchProperties(query = '', page = 1, limit = 6) {
  const skip = (page - 1) * limit

  // Build the where clause for both queries
  const where = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { location: { contains: query, mode: 'insensitive' } },
    ],
  }

  // Get properties with pagination
  const properties = await prisma.property.findMany({
    where,
    skip,
    take: limit,
    orderBy: { title: 'asc' },
  })

  // Get total count for pagination
  const totalCount = await prisma.property.count({ where })

  return {
    properties,
    totalCount,
  }
}

async function fetchPropertyById(id) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return {
        error: `Property with ID ${id} not found`,
      }
    }

    return {
      property,
    }
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error)
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

async function fetchNearbyProperties(propertyId, lat, lng, distance = 10, limit = 3) {
  // Calculate the approximate latitude/longitude range
  // 1 degree of latitude is approximately 111 kilometers
  const latRange = distance / 111

  const properties = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      lat: {
        gte: lat - latRange,
        lte: lat + latRange,
      },
      lng: {
        gte: lng - latRange,
        lte: lng + latRange,
      },
    },
    take: limit,
  })

  return properties
}

async function testFetchProperties() {
  console.log('Testing fetchProperties...')
  try {
    const result = await fetchProperties('', 1, 3)
    console.log(`Found ${result.totalCount} properties, showing ${result.properties.length}:`)
    result.properties.forEach(property => {
      console.log(`- ${property.title} (${property.location}): $${property.price}`)
    })
  } catch (error) {
    console.error('Error testing fetchProperties:', error)
  }
}

async function testFetchPropertyById(id) {
  console.log(`\nTesting fetchPropertyById with ID: ${id}...`)
  try {
    const result = await fetchPropertyById(id)
    if (result.error) {
      console.log(`Error: ${result.error}`)
    } else {
      console.log('Property found:')
      console.log(
        `- ${result.property.title} (${result.property.location}): $${result.property.price}`
      )

      // Test nearby properties
      await testFetchNearbyProperties(id, result.property.lat, result.property.lng)
    }
  } catch (error) {
    console.error('Error testing fetchPropertyById:', error)
  }
}

async function testFetchNearbyProperties(id, lat, lng) {
  console.log(`\nTesting fetchNearbyProperties near ${lat}, ${lng}...`)
  try {
    const properties = await fetchNearbyProperties(id, lat, lng, 50, 3)
    console.log(`Found ${properties.length} nearby properties:`)
    properties.forEach(property => {
      console.log(`- ${property.title} (${property.location}): $${property.price}`)
    })
  } catch (error) {
    console.error('Error testing fetchNearbyProperties:', error)
  }
}

async function main() {
  // Test fetching properties
  await testFetchProperties()

  // Get the first property ID from the results
  const result = await fetchProperties()
  if (result.properties.length > 0) {
    const firstPropertyId = result.properties[0].id
    await testFetchPropertyById(firstPropertyId)
  }
}

main()
  .catch(error => {
    console.error('Error running tests:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
