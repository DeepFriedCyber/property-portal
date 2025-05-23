// apps/api/src/routes/search.ts
import { NextFunction, Request, Response, Router } from 'express'

import { winstonLogger as logger } from '../../../../lib/logging/winston-logger'
import { BadRequest, InternalServerError } from '../../../../lib/middleware/errorHandler'
import { createRateLimitMiddleware } from '../../../../lib/rate-limit/factory'
import {
  generateEmbeddings,
  getSimilarProperties,
  semanticPropertySearch,
} from '../../../../services/vectorSearch'

const router = Router()

// Extend Request to include 'id' (added by logging or tracking middleware)
interface RequestWithId extends Request {
  id?: string
}

const isNumeric = (value: unknown): boolean =>
  typeof value === 'number' ||
  (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)))

// Apply rate limiting
const semanticSearchLimiter = createRateLimitMiddleware({
  interval: 60 * 1000,
  maxRequests: 20,
  prefix: 'ratelimit:semantic:',
})

const similarPropertiesLimiter = createRateLimitMiddleware({
  interval: 60 * 1000,
  maxRequests: 50,
  prefix: 'ratelimit:similar:',
})

/**
 * POST /api/search/semantic
 */
router.post(
  '/semantic',
  semanticSearchLimiter,
  async (req: RequestWithId, res: Response, next: NextFunction) => {
    try {
      const { query, filters = {}, options = {} } = req.body
      if (!query || typeof query !== 'string' || query.trim() === '') {
        throw BadRequest('Search query is required')
      }
      if (filters.minPrice && !isNumeric(filters.minPrice)) {
        throw BadRequest('minPrice must be a number')
      }
      if (filters.maxPrice && !isNumeric(filters.maxPrice)) {
        throw BadRequest('maxPrice must be a number')
      }
      if (filters.bedrooms && !isNumeric(filters.bedrooms)) {
        throw BadRequest('bedrooms must be a number')
      }
      if (filters.bathrooms && !isNumeric(filters.bathrooms)) {
        throw BadRequest('bathrooms must be a number')
      }
      if (options.limit && !isNumeric(options.limit)) {
        throw BadRequest('limit must be a number')
      }
      if (options.offset && !isNumeric(options.offset)) {
        throw BadRequest('offset must be a number')
      }
      if (
        options.similarityThreshold &&
        (!isNumeric(options.similarityThreshold) ||
          Number(options.similarityThreshold) < 0 ||
          Number(options.similarityThreshold) > 1)
      ) {
        throw BadRequest('similarityThreshold must be a number between 0 and 1')
      }
      logger.info('Semantic search request', {
        context: {
          query,
          filters,
          options,
          requestId: req.id,
        },
      })
      const embeddings = await generateEmbeddings(query)
      const results = await semanticPropertySearch(embeddings, filters, options)
      res.json({
        success: true,
        data: {
          query,
          results,
          count: results.length,
          filters,
          options,
        },
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('pgvector extension')) {
        return next(
          InternalServerError('Vector search is not available', {
            details: 'The pgvector extension is not installed on the database',
          })
        )
      }
      next(error)
    }
  }
)

/**
 * GET /api/search/similar/:propertyId
 */
router.get(
  '/similar/:propertyId',
  similarPropertiesLimiter,
  async (req: RequestWithId, res: Response, next: NextFunction) => {
    try {
      const { propertyId } = req.params
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5
      if (!propertyId) {
        throw BadRequest('Property ID is required')
      }
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw BadRequest('limit must be a number between 1 and 50')
      }
      logger.info('Similar properties request', {
        context: {
          propertyId,
          limit,
          requestId: req.id,
        },
      })
      const similarProperties = await getSimilarProperties(propertyId, limit)
      res.json({
        success: true,
        data: {
          referencePropertyId: propertyId,
          similarProperties,
          count: similarProperties.length,
        },
      })
    } catch (error: unknown) {
      next(error)
    }
  }
)

export default router
