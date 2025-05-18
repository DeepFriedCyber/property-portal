import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { generateEmbedding } from '@/lib/embedding'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { title, location, price, imageUrl, lat, lng, description } = req.body

    // Generate embedding from property details
    const vector = await generateEmbedding(`${title}. ${description}. ${location}`)

    // Create new property with embedding
    const newProperty = await prisma.property.create({
      data: {
        title,
        location,
        price: parseInt(price),
        imageUrl,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        description,
        embedding: Buffer.from(Float32Array.from(vector).buffer),
      },
    })

    return res.status(201).json(newProperty)
  } catch (error) {
    console.error('Error creating property:', error)
    return res
      .status(500)
      .json({ message: 'Error creating property', error: (error as Error).message })
  }
}
