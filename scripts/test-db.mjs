// Simple script to test database connectivity
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing database connection...')

    // Get all properties
    const properties = await prisma.property.findMany({
      take: 3,
      orderBy: { title: 'asc' },
    })

    console.log(`Found ${properties.length} properties:`)
    properties.forEach(property => {
      console.log(`- ${property.title} (${property.location}): $${property.price}`)
    })

    // Get property count
    const count = await prisma.property.count()
    console.log(`\nTotal properties in database: ${count}`)

    if (properties.length > 0) {
      const firstProperty = properties[0]
      console.log(`\nDetails for property "${firstProperty.title}":`)
      console.log(JSON.stringify(firstProperty, null, 2))

      // Find nearby properties
      const nearbyProperties = await prisma.property.findMany({
        where: {
          id: { not: firstProperty.id },
          lat: {
            gte: firstProperty.lat - 0.5,
            lte: firstProperty.lat + 0.5,
          },
          lng: {
            gte: firstProperty.lng - 0.5,
            lte: firstProperty.lng + 0.5,
          },
        },
        take: 2,
      })

      console.log(`\nFound ${nearbyProperties.length} nearby properties:`)
      nearbyProperties.forEach(property => {
        console.log(`- ${property.title} (${property.location}): $${property.price}`)
      })
    }

    console.log('\nDatabase test completed successfully!')
  } catch (error) {
    console.error('Error testing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
