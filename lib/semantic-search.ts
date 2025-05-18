import { prisma } from './db'
import { generateEmbedding } from './embedding'

export async function semanticPropertySearch(query: string) {
  const vector = await generateEmbedding(query)
  const vectorBuffer = Buffer.from(Float32Array.from(vector).buffer)

  const results = await prisma.$queryRawUnsafe(
    `
    SELECT *, embedding <-> $1 AS distance
    FROM "Property"
    ORDER BY distance ASC
    LIMIT 10
  `,
    vectorBuffer
  )

  return results
}
