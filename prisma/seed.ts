import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.property.deleteMany({})

  // Add sample properties
  const properties = [
    {
      id: uuidv4(),
      title: 'Modern Apartment in City Center',
      location: 'London',
      postcode: 'EC1A 1BB',
      price: 450000,
      imageUrl: 'https://example.com/images/apartment1.jpg',
      lat: 51.5074,
      lng: -0.1278,
      description: 'A beautiful modern apartment in the heart of the city.',
      councilTaxBand: 'D',
      tenure: 'Leasehold',
      epcRating: 'B',
    },
    // Add more sample properties
  ]

  for (const property of properties) {
    await prisma.property.create({
      data: property,
    })
  }

  console.log(`Database has been seeded with ${properties.length} properties`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
