import { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { prisma } from '@/lib/db'
import { generatePropertyEmbedding } from '@/lib/embeddings'

import { GET, POST } from './route'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    property: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/embeddings', () => ({
  generatePropertyEmbedding: vi.fn(),
}))

// Helper to create a mock NextRequest
function createMockRequest(method: string, url: string, body?: any): NextRequest {
  const request = {
    method,
    nextUrl: new URL(url, 'http://localhost:3000'),
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest

  return request
}

describe('Similar Properties API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/properties/similar', () => {
    it('returns 400 if query parameter is missing', async () => {
      // Create a request without a query parameter
      const request = createMockRequest('GET', 'http://localhost:3000/api/properties/similar')

      // Call the handler
      const response = await GET(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Query parameter is required' })
    })

    it('returns similar properties based on query', async () => {
      // Mock the embedding generation
      const mockEmbedding = Array(1536).fill(0.1)
      vi.mocked(generatePropertyEmbedding).mockResolvedValueOnce(mockEmbedding)

      // Mock the database query
      const mockProperties = [
        { id: '1', title: 'Property 1', similarity: 0.1 },
        { id: '2', title: 'Property 2', similarity: 0.2 },
      ]
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockProperties)

      // Create a request with a query parameter
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/properties/similar?query=modern+apartment&limit=2'
      )

      // Call the handler
      const response = await GET(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(200)
      expect(data).toEqual({ properties: mockProperties })

      // Verify the embedding was generated with the correct parameters
      expect(generatePropertyEmbedding).toHaveBeenCalledWith({
        title: 'modern apartment',
        location: '',
      })

      // Verify the database query was called with the correct parameters
      expect(prisma.$queryRaw).toHaveBeenCalled()
    })

    it('handles errors and returns 500', async () => {
      // Mock the embedding generation to throw an error
      vi.mocked(generatePropertyEmbedding).mockRejectedValueOnce(new Error('Test error'))

      // Create a request with a query parameter
      const request = createMockRequest(
        'GET',
        'http://localhost:3000/api/properties/similar?query=modern+apartment'
      )

      // Call the handler
      const response = await GET(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to find similar properties' })
    })
  })

  describe('POST /api/properties/similar', () => {
    it('returns 400 if propertyId is missing', async () => {
      // Create a request without a propertyId
      const request = createMockRequest('POST', 'http://localhost:3000/api/properties/similar', {})

      // Call the handler
      const response = await POST(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Property ID is required' })
    })

    it('returns 404 if property is not found', async () => {
      // Mock the database query to return null
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce(null)

      // Create a request with a propertyId
      const request = createMockRequest('POST', 'http://localhost:3000/api/properties/similar', {
        propertyId: '999',
      })

      // Call the handler
      const response = await POST(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Property not found or has no embedding' })
    })

    it('returns 404 if property has no embedding', async () => {
      // Mock the database query to return a property without an embedding
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: '1',
        embedding: null,
      })

      // Create a request with a propertyId
      const request = createMockRequest('POST', 'http://localhost:3000/api/properties/similar', {
        propertyId: '1',
      })

      // Call the handler
      const response = await POST(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Property not found or has no embedding' })
    })

    it('returns similar properties based on propertyId', async () => {
      // Mock the database query to return a property with an embedding
      const mockEmbedding = Array(1536).fill(0.1)
      vi.mocked(prisma.property.findUnique).mockResolvedValueOnce({
        id: '1',
        embedding: mockEmbedding,
      })

      // Mock the database query for similar properties
      const mockProperties = [
        { id: '2', title: 'Property 2', similarity: 0.1 },
        { id: '3', title: 'Property 3', similarity: 0.2 },
      ]
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockProperties)

      // Create a request with a propertyId
      const request = createMockRequest('POST', 'http://localhost:3000/api/properties/similar', {
        propertyId: '1',
        limit: 2,
      })

      // Call the handler
      const response = await POST(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(200)
      expect(data).toEqual({ properties: mockProperties })

      // Verify the database queries were called with the correct parameters
      expect(prisma.property.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, embedding: true },
      })

      expect(prisma.$queryRaw).toHaveBeenCalled()
    })

    it('handles errors and returns 500', async () => {
      // Mock the database query to throw an error
      vi.mocked(prisma.property.findUnique).mockRejectedValueOnce(new Error('Test error'))

      // Create a request with a propertyId
      const request = createMockRequest('POST', 'http://localhost:3000/api/properties/similar', {
        propertyId: '1',
      })

      // Call the handler
      const response = await POST(request)
      const data = await response.json()

      // Verify the response
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to find similar properties' })
    })
  })
})
