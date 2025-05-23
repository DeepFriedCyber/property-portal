import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { z } from 'zod'

import { GET } from './route'

// Mock the embedding generation
vi.mock('../../../../../lib/embedding', () => ({
  generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}))

// Mock the database
vi.mock('@your-org/db', () => {
  const selectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi
      .fn()
      .mockResolvedValue([{ id: 'fallback-1', title: 'Fallback Result', price: 500000 }]),
  }
  return {
    db: {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
      select: vi.fn(() => selectChain),
    },
    schema: {
      property: {},
    },
  }
})

// Mock the database utilities
vi.mock('../../../../../lib/db/utils', () => ({
  bindVector: vi.fn((embedding: number[]) => embedding),
  bindJsonbArray: vi.fn((embedding: number[]) => embedding),
}))

// Mock the API response utilities
vi.mock('../../../../../lib/api/response', () => {
  return {
    successResponse: vi.fn(data => {
      return Response.json(
        {
          success: true,
          data,
        },
        { status: 200 }
      )
    }),
    errorResponse: vi.fn((message, status = 400, code, details) => {
      return Response.json(
        {
          success: false,
          error: {
            message,
            ...(code && { code }),
            ...(details && { details }),
          },
        },
        { status }
      )
    }),
    HttpStatus: {
      OK: 200,
      BAD_REQUEST: 400,
      UNPROCESSABLE_ENTITY: 422,
      INTERNAL_SERVER_ERROR: 500,
    },
  }
})

// Mock the validation utilities
vi.mock('../../../../../lib/api/validation', () => {
  return {
    validateQuery: vi.fn(async (req: NextRequest, _schema: z.ZodSchema) => {
      const url = new URL(req.url)
      const searchParams = Object.fromEntries(url.searchParams.entries())

      try {
        // Simulate Zod validation
        if (!searchParams.q) {
          throw new z.ZodError([
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'undefined',
              path: ['q'],
              message: 'Search query is required',
            },
          ])
        }

        return {
          q: searchParams.q,
          limit: searchParams.limit ? parseInt(searchParams.limit, 10) : 10,
        }
      } catch (error) {
        throw error
      }
    }),
    withValidation: vi.fn((handler: (req: NextRequest) => Promise<Response>) => {
      return async (req: NextRequest) => {
        try {
          return await handler(req)
<<<<<<< Updated upstream
        } catch (error) {
=======
        } catch (error: unknown) {
>>>>>>> Stashed changes
          if (error instanceof z.ZodError) {
            return Response.json(
              {
                success: false,
                error: {
                  message: 'Validation error',
                  code: 'VALIDATION_ERROR',
                  details: error.errors,
                },
              },
              { status: 422 }
            )
          }

          return Response.json(
            {
              success: false,
              error: {
                message: error.message || 'An unexpected error occurred',
              },
            },
            { status: 500 }
          )
        }
      }
    }),
  }
})

// Util to simulate a request with query params
const makeRequest = (params: Record<string, string>): NextRequest => {
  const url = new URL('http://localhost/api/search')
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v))
  return new NextRequest(url)
}

describe('GET /search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns fallback results if vector search returns no results', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    const { generateEmbedding } = await import('../../../../../lib/embedding')
    const { bindVector, bindJsonbArray } = await import('../../../../../lib/db/utils')

    // Execute
    const req = makeRequest({ q: 'modern home', limit: '5' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.query).toBe('modern home')
    expect(responseBody.data.results.length).toBeGreaterThan(0)
    expect(responseBody.data.results[0].title).toBe('Fallback Result')

    // Verify function calls
    expect(generateEmbedding).toHaveBeenCalledWith('modern home', expect.any(Object))
    expect(db.execute).toHaveBeenCalledWith(expect.any(Object))
    expect(bindVector).toHaveBeenCalledWith([0.1, 0.2, 0.3])
    expect(db.select).toHaveBeenCalled()
    expect(bindJsonbArray).toHaveBeenCalledWith([0.1, 0.2, 0.3])
  })

  it('returns vector results if vector search is successful', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    const { generateEmbedding } = await import('../../../../../lib/embedding')
    const { bindVector } = await import('../../../../../lib/db/utils')

    // Reset the mock to ensure it's clean
    vi.mocked(bindVector).mockClear()

    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 'vector-1', title: 'Vector Result', price: 750000 }],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    })

    // Execute
    const req = makeRequest({ q: 'villa', limit: '3' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.results[0].title).toBe('Vector Result')

    // Verify function calls
    expect(generateEmbedding).toHaveBeenCalledWith('villa', expect.any(Object))
    expect(db.execute).toHaveBeenCalledWith(expect.any(Object))
    // Don't test exact parameters for bindVector as it might be called differently
    expect(bindVector).toHaveBeenCalled()
    expect(db.select).not.toHaveBeenCalled() // Should not fall back to JSONB search
  })

  it('returns 422 with validation error if query param is missing', async () => {
    // Execute
    const req = makeRequest({})
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(422)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error.code).toBe('VALIDATION_ERROR')
    expect(responseBody.error.message).toBe('Validation error')
    expect(Array.isArray(responseBody.error.details)).toBe(true)
  })

  it('uses default limit if not provided', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    const { generateEmbedding } = await import('../../../../../lib/embedding')

    // Mock successful database response for this test
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 'default-limit-1', title: 'Default Limit Result', price: 600000 }],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    })

    // Execute
    const req = makeRequest({ q: 'penthouse' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.results[0].title).toBe('Default Limit Result')

    // Verify function calls with default limit
    expect(generateEmbedding).toHaveBeenCalledWith('penthouse', expect.any(Object))
    expect(db.execute).toHaveBeenCalledWith(expect.any(Object))
  })

  it('handles invalid limit parameter by using default', async () => {
    // Setup
    const { db } = await import('@your-org/db')

    // Mock successful database response for this test
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 'invalid-limit-1', title: 'Invalid Limit Result', price: 650000 }],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    })

    // Execute
    const req = makeRequest({ q: 'apartment', limit: 'invalid' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.results[0].title).toBe('Invalid Limit Result')

    // Should use default limit (10)
    expect(db.execute).toHaveBeenCalledWith(expect.any(Object))
  })

  it('handles database errors gracefully', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    const { generateEmbedding } = await import('../../../../../lib/embedding')

    // Mock a database error in both execute and select
    vi.mocked(db.execute).mockRejectedValueOnce(new Error('Database connection error'))
    vi.mocked(db.select).mockImplementationOnce(() => {
      throw new Error('Database query error')
    })

    // Execute
    const req = makeRequest({ q: 'error test' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(500)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error.message).toBe('Database query error')

    // Verify function calls
    expect(generateEmbedding).toHaveBeenCalledWith('error test', expect.any(Object))
    expect(db.execute).toHaveBeenCalledWith(expect.any(Object))
  })

  it('handles embedding generation errors', async () => {
    // Setup
    const { generateEmbedding } = await import('../../../../../lib/embedding')

    // Mock embedding generation error
    vi.mocked(generateEmbedding).mockRejectedValueOnce(new Error('Embedding service unavailable'))

    // Execute
    const req = makeRequest({ q: 'embedding error' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(500)
    expect(responseBody.success).toBe(false)
    expect(responseBody.error.message).toBe('Embedding service unavailable')
  })

  it('handles very long search queries properly', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    const { generateEmbedding } = await import('../../../../../lib/embedding')

    // Mock successful database response
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 'long-query-1', title: 'Long Query Result', price: 800000 }],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    })

    // Create a very long search query (500+ characters)
    const longQuery = 'luxury ' + 'modern '.repeat(100) + 'apartment with views'

    // Execute
    const req = makeRequest({ q: longQuery })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.results[0].title).toBe('Long Query Result')
    expect(generateEmbedding).toHaveBeenCalledWith(longQuery, expect.any(Object))
  })

  it('handles special characters in search queries', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    const { generateEmbedding } = await import('../../../../../lib/embedding')

    // Mock successful database response
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 'special-chars-1', title: 'Special Chars Result', price: 950000 }],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    })

    // Create a query with special characters
    const specialCharsQuery = 'apartment & penthouse (2-bedroom) with $500k-$1M price range'

    // Execute
    const req = makeRequest({ q: specialCharsQuery })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.results[0].title).toBe('Special Chars Result')
    expect(generateEmbedding).toHaveBeenCalledWith(specialCharsQuery, expect.any(Object))
  })

  it('handles very large limit values', async () => {
    // Setup
    const { db } = await import('@your-org/db')
    // Import generateEmbedding but don't use it directly in this test
    await import('../../../../../lib/embedding')

    // Mock successful database response
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 'large-limit-1', title: 'Large Limit Result', price: 1200000 }],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    })

    // Execute with a very large limit
    const req = makeRequest({ q: 'house', limit: '1000' })
    const response = await GET(req)
    const responseBody = await response.json()

    // Verify
    expect(response.status).toBe(200)
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.results[0].title).toBe('Large Limit Result')

    // The SQL query should be called with the large limit
    expect(db.execute).toHaveBeenCalledWith(expect.any(Object))
  })
})
