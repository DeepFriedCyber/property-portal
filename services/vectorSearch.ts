// services/vectorSearch.ts
import { Pool } from 'pg'
import pgvector from 'pgvector'

import { winstonLogger as logger } from '../lib/logging/winston-logger'

// Initialize pgvector
pgvector.init()

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
})

// Log pool errors
pool.on('error', err => {
  logger.error('Unexpected error on idle client', {
    context: {
      error: err.message,
      stack: err.stack,
    },
  })
})

/**
 * Interface for property search filters
 */
export interface PropertySearchFilters {
  minPrice?: number
  maxPrice?: number
  location?: string
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  status?: 'available' | 'sold' | 'pending'
}

/**
 * Interface for property search options
 */
export interface PropertySearchOptions {
  limit?: number
  offset?: number
  similarityThreshold?: number
}

/**
 * Perform a semantic search on properties using vector embeddings
 *
 * @param queryEmbedding - The vector embedding of the search query
 * @param filters - Optional filters to apply to the search
 * @param options - Optional search options
 * @returns Array of properties sorted by similarity
 */
export async function semanticPropertySearch(
  queryEmbedding: number[],
  filters: PropertySearchFilters = {},
  options: PropertySearchOptions = {}
) {
  const startTime = Date.now()

  try {
    // Set default options
    const limit = options.limit || 10
    const offset = options.offset || 0
    const similarityThreshold = options.similarityThreshold || 0.5

    // Extract filters
    const { minPrice, maxPrice, location, bedrooms, bathrooms, propertyType, status } = filters

    // Build the query with dynamic filters
    let query = `
      SELECT 
        p.*,
        1 - (p.embedding <=> $1) AS similarity
      FROM properties p
      WHERE 1 = 1
    `

    // Add filter conditions
    const queryParams: any[] = [pgvector.toSql(queryEmbedding)]
    let paramIndex = 2

    // Add price filters
    if (minPrice !== undefined) {
      query += ` AND p.price >= $${paramIndex++}`
      queryParams.push(minPrice)
    }

    if (maxPrice !== undefined) {
      query += ` AND p.price <= $${paramIndex++}`
      queryParams.push(maxPrice)
    }

    // Add location filter
    if (location) {
      query += ` AND p.location ILIKE '%' || $${paramIndex++} || '%'`
      queryParams.push(location)
    }

    // Add bedrooms filter
    if (bedrooms !== undefined) {
      query += ` AND p.bedrooms >= $${paramIndex++}`
      queryParams.push(bedrooms)
    }

    // Add bathrooms filter
    if (bathrooms !== undefined) {
      query += ` AND p.bathrooms >= $${paramIndex++}`
      queryParams.push(bathrooms)
    }

    // Add property type filter
    if (propertyType) {
      query += ` AND p.property_type = $${paramIndex++}`
      queryParams.push(propertyType)
    }

    // Add status filter
    if (status) {
      query += ` AND p.status = $${paramIndex++}`
      queryParams.push(status)
    }

    // Add similarity threshold
    query += ` AND (1 - (p.embedding <=> $1)) >= $${paramIndex++}`
    queryParams.push(similarityThreshold)

    // Add ordering and pagination
    query += `
      ORDER BY similarity DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `

    queryParams.push(limit, offset)

    // Execute the query
    const { rows } = await pool.query(query, queryParams)

    // Log the search performance
    const duration = Date.now() - startTime
    logger.info('Vector search completed', {
      context: {
        duration: `${duration}ms`,
        resultCount: rows.length,
        filters,
        options,
      },
    })

    return rows
  } catch (error) {
    // Log the error
    logger.error('Vector search failed', {
      context: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filters,
        options,
      },
    })

    throw error
  }
}

/**
 * Get similar properties based on a reference property ID
 *
 * @param propertyId - The ID of the reference property
 * @param limit - Maximum number of similar properties to return
 * @returns Array of similar properties
 */
export async function getSimilarProperties(propertyId: string, limit = 5) {
  try {
    // First, get the embedding of the reference property
    const propertyQuery = `
      SELECT embedding
      FROM properties
      WHERE id = $1
    `

    const propertyResult = await pool.query(propertyQuery, [propertyId])

    if (propertyResult.rows.length === 0) {
      throw new Error(`Property with ID ${propertyId} not found`)
    }

    const embedding = propertyResult.rows[0].embedding

    // Then, find similar properties
    const similarQuery = `
      SELECT 
        p.*,
        1 - (p.embedding <=> $1) AS similarity
      FROM properties p
      WHERE p.id != $2
      ORDER BY similarity DESC
      LIMIT $3
    `

    const { rows } = await pool.query(similarQuery, [pgvector.toSql(embedding), propertyId, limit])

    return rows
  } catch (error) {
    logger.error('Failed to get similar properties', {
      context: {
        propertyId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })

    throw error
  }
}

/**
 * Generate embeddings for a text query using an external embedding service
 * This is a placeholder - in a real application, you would call an embedding API
 *
 * @param query - The text query to generate embeddings for
 * @returns Vector embedding of the query
 */
export async function generateEmbeddings(query: string): Promise<number[]> {
  try {
    // In a real application, you would call an embedding API like OpenAI or Cohere
    // This is a placeholder that returns a random embedding
    logger.info('Generating embeddings for query', {
      context: {
        query: query.length > 100 ? `${query.substring(0, 100)}...` : query,
      },
    })

    // For demonstration purposes, generate a random embedding
    // In production, replace this with a call to your embedding service
    const dimension = 384 // Common embedding dimension
    const embedding = Array.from({ length: dimension }, () => Math.random() * 2 - 1)

    // Normalize the embedding (convert to unit vector)
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    const normalizedEmbedding = embedding.map(val => val / magnitude)

    return normalizedEmbedding
  } catch (error) {
    logger.error('Failed to generate embeddings', {
      context: {
        query,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })

    throw error
  }
}

export default {
  semanticPropertySearch,
  getSimilarProperties,
  generateEmbeddings,
}
