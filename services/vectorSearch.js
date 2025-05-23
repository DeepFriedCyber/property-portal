"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticPropertySearch = semanticPropertySearch;
exports.getSimilarProperties = getSimilarProperties;
exports.generateEmbeddings = generateEmbeddings;
// services/vectorSearch.ts
const pg_1 = require("pg");
const pgvector_1 = __importDefault(require("pgvector"));
const winston_logger_1 = require("../lib/logging/winston-logger");
// Create a connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection
});
// Log pool errors
pool.on('error', err => {
    winston_logger_1.winstonLogger.error('Unexpected error on idle client', {
        context: {
            error: err.message,
            stack: err.stack,
        },
    });
});
/**
 * Perform a semantic search on properties using vector embeddings
 *
 * @param queryEmbedding - The vector embedding of the search query
 * @param filters - Optional filters to apply to the search
 * @param options - Optional search options
 * @returns Array of properties sorted by similarity
 */
async function semanticPropertySearch(queryEmbedding, filters = {}, options = {}) {
    const startTime = Date.now();
    try {
        // Set default options
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        const similarityThreshold = options.similarityThreshold || 0.5;
        // Extract filters
        const { minPrice, maxPrice, location, bedrooms, bathrooms, propertyType, status } = filters;
        // Build the query with dynamic filters
        let query = `
      SELECT 
        p.*,
        1 - (p.embedding <=> $1) AS similarity
      FROM properties p
      WHERE 1 = 1
    `;
        // Add filter conditions
        const queryParams = [pgvector_1.default.toSql(queryEmbedding)];
        let paramIndex = 2;
        // Add price filters
        if (minPrice !== undefined) {
            query += ` AND p.price >= $${paramIndex++}`;
            queryParams.push(minPrice);
        }
        if (maxPrice !== undefined) {
            query += ` AND p.price <= $${paramIndex++}`;
            queryParams.push(maxPrice);
        }
        // Add location filter
        if (location) {
            query += ` AND p.location ILIKE '%' || $${paramIndex++} || '%'`;
            queryParams.push(location);
        }
        // Add bedrooms filter
        if (bedrooms !== undefined) {
            query += ` AND p.bedrooms >= $${paramIndex++}`;
            queryParams.push(bedrooms);
        }
        // Add bathrooms filter
        if (bathrooms !== undefined) {
            query += ` AND p.bathrooms >= $${paramIndex++}`;
            queryParams.push(bathrooms);
        }
        // Add property type filter
        if (propertyType) {
            query += ` AND p.property_type = $${paramIndex++}`;
            queryParams.push(propertyType);
        }
        // Add status filter
        if (status) {
            query += ` AND p.status = $${paramIndex++}`;
            queryParams.push(status);
        }
        // Add similarity threshold
        query += ` AND (1 - (p.embedding <=> $1)) >= $${paramIndex++}`;
        queryParams.push(similarityThreshold);
        // Add ordering and pagination
        query += `
      ORDER BY similarity DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;
        queryParams.push(limit, offset);
        // Execute the query
        const { rows } = await pool.query(query, queryParams);
        // Log the search performance
        const duration = Date.now() - startTime;
        winston_logger_1.winstonLogger.info('Vector search completed', {
            context: {
                duration: `${duration}ms`,
                resultCount: rows.length,
                filters,
                options,
            },
        });
        return rows;
    }
    catch (error) {
        // Log the error
        winston_logger_1.winstonLogger.error('Vector search failed', {
            context: {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                filters,
                options,
            },
        });
        throw error;
    }
}
/**
 * Get similar properties based on a reference property ID
 *
 * @param propertyId - The ID of the reference property
 * @param limit - Maximum number of similar properties to return
 * @returns Array of similar properties
 */
async function getSimilarProperties(propertyId, limit = 5) {
    try {
        // First, get the embedding of the reference property
        const propertyQuery = `
      SELECT embedding
      FROM properties
      WHERE id = $1
    `;
        const propertyResult = await pool.query(propertyQuery, [propertyId]);
        if (propertyResult.rows.length === 0) {
            throw new Error(`Property with ID ${propertyId} not found`);
        }
        const embedding = propertyResult.rows[0].embedding;
        // Then, find similar properties
        const similarQuery = `
      SELECT 
        p.*,
        1 - (p.embedding <=> $1) AS similarity
      FROM properties p
      WHERE p.id != $2
      ORDER BY similarity DESC
      LIMIT $3
    `;
        const { rows } = await pool.query(similarQuery, [pgvector_1.default.toSql(embedding), propertyId, limit]);
        return rows;
    }
    catch (error) {
        winston_logger_1.winstonLogger.error('Failed to get similar properties', {
            context: {
                propertyId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
        });
        throw error;
    }
}
/**
 * Generate embeddings for a text query using an external embedding service
 * This is a placeholder - in a real application, you would call an embedding API
 *
 * @param query - The text query to generate embeddings for
 * @returns Vector embedding of the query
 */
async function generateEmbeddings(query) {
    try {
        // In a real application, you would call an embedding API like OpenAI or Cohere
        // This is a placeholder that returns a random embedding
        winston_logger_1.winstonLogger.info('Generating embeddings for query', {
            context: {
                query: query.length > 100 ? `${query.substring(0, 100)}...` : query,
            },
        });
        // For demonstration purposes, generate a random embedding
        // In production, replace this with a call to your embedding service
        const dimension = 384; // Common embedding dimension
        const embedding = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
        // Normalize the embedding (convert to unit vector)
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        const normalizedEmbedding = embedding.map(val => val / magnitude);
        return normalizedEmbedding;
    }
    catch (error) {
        winston_logger_1.winstonLogger.error('Failed to generate embeddings', {
            context: {
                query,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
        });
        throw error;
    }
}
exports.default = {
    semanticPropertySearch,
    getSimilarProperties,
    generateEmbeddings,
};
