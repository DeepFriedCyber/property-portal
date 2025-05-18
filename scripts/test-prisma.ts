import { prisma } from '../lib/db'

async function testConnection() {
  try {
    // Test a simple query
    const count = await prisma.property.count()
    console.log(`Connection successful! Found ${count} properties.`)

    // Test vector capabilities if you have properties with embeddings
    if (count > 0) {
      const property = await prisma.property.findFirst({
        where: {
          embedding: {
            not: null,
          },
        },
      })
      console.log('Sample property:', property?.title)
    }
  } catch (error) {
    console.error('Database connection test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
