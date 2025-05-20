import { Prisma } from '@prisma/client'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { prisma } from '@/lib/db'

// Mock the Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    property: {
      findMany: vi.fn(),
    },
  },
}))

// Create a helper function to simulate the pgvector query
async function findSimilarProperties(
  embedding: number[],
  limit: number = 5,
  excludeId?: string
): Promise<any[]> {
  // Build the where clause
  const whereClause = excludeId
    ? Prisma.sql`WHERE id != ${excludeId} AND embedding IS NOT NULL`
    : Prisma.sql`WHERE embedding IS NOT NULL`

  // Execute the query
  return prisma.$queryRaw(Prisma.sql`
    SELECT 
      id, title, description, price, bedrooms, bathrooms, 
      area, location, address, lat, lng, images, features,
      councilTaxBand, epcRating, tenure, createdAt, updatedAt,
      embedding <=> ${Prisma.sql`${embedding}`}::vector AS similarity
    FROM "Property"
    ${whereClause}
    ORDER BY similarity
    LIMIT ${Prisma.sql`${limit}`}
  `)
}

describe('Vector Search', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should execute a pgvector similarity search query', async () => {
    // Mock embedding vector
    const mockEmbedding = Array(1536).fill(0.1)

    // Mock the query result
    const mockProperties = [
      { id: '1', title: 'Property 1', similarity: 0.1 },
      { id: '2', title: 'Property 2', similarity: 0.2 },
    ]
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockProperties)

    // Execute the search
    const result = await findSimilarProperties(mockEmbedding, 2)

    // Verify the result
    expect(result).toEqual(mockProperties)

    // Verify the query was called with the correct parameters
    expect(prisma.$queryRaw).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.arrayContaining([mockEmbedding, 2]),
      })
    )
  })

  it('should exclude a specific property ID when provided', async () => {
    // Mock embedding vector
    const mockEmbedding = Array(1536).fill(0.1)
    const excludeId = '123'

    // Mock the query result
    const mockProperties = [
      { id: '1', title: 'Property 1', similarity: 0.1 },
      { id: '2', title: 'Property 2', similarity: 0.2 },
    ]
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockProperties)

    // Execute the search with an excluded ID
    const result = await findSimilarProperties(mockEmbedding, 2, excludeId)

    // Verify the result
    expect(result).toEqual(mockProperties)

    // Verify the query was called with the correct parameters
    expect(prisma.$queryRaw).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.arrayContaining([excludeId, mockEmbedding, 2]),
      })
    )
  })

  it('should handle empty result sets', async () => {
    // Mock embedding vector
    const mockEmbedding = Array(1536).fill(0.1)

    // Mock an empty result
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([])

    // Execute the search
    const result = await findSimilarProperties(mockEmbedding)

    // Verify the result is empty
    expect(result).toEqual([])
    expect(result.length).toBe(0)
  })

  it('should propagate database errors', async () => {
    // Mock embedding vector
    const mockEmbedding = Array(1536).fill(0.1)

    // Mock a database error
    const dbError = new Error('Database connection error')
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(dbError)

    // Execute the search and expect it to throw
    await expect(findSimilarProperties(mockEmbedding)).rejects.toThrow('Database connection error')
  })
})
