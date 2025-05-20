// apps/api/src/routes/search.ts
import { Router } from 'express';
import { 
  BadRequest, 
  InternalServerError 
} from '../../../../lib/middleware/errorHandler';
import { winstonLogger as logger } from '../../../../lib/logging/winston-logger';
import vectorSearchService from '../../../../services/vectorSearch';
import { createRateLimitMiddleware } from '../../../../lib/rate-limit/factory';

const router = Router();

// Apply rate limiting to all search routes
// Semantic search is more resource-intensive, so we limit it more strictly
const semanticSearchLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 20,     // 20 requests per minute
  prefix: 'ratelimit:semantic:',
});

// Similar properties search is less intensive
const similarPropertiesLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 50,     // 50 requests per minute
  prefix: 'ratelimit:similar:',
});

/**
 * POST /api/search/semantic
 * Perform a semantic search on properties
 */
router.post('/semantic', semanticSearchLimiter, async (req, res, next) => {
  try {
    // Extract search parameters from request body
    const { 
      query, 
      filters = {}, 
      options = {} 
    } = req.body;
    
    // Validate query
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw BadRequest('Search query is required');
    }
    
    // Validate filters
    if (filters.minPrice && isNaN(Number(filters.minPrice))) {
      throw BadRequest('minPrice must be a number');
    }
    
    if (filters.maxPrice && isNaN(Number(filters.maxPrice))) {
      throw BadRequest('maxPrice must be a number');
    }
    
    if (filters.bedrooms && isNaN(Number(filters.bedrooms))) {
      throw BadRequest('bedrooms must be a number');
    }
    
    if (filters.bathrooms && isNaN(Number(filters.bathrooms))) {
      throw BadRequest('bathrooms must be a number');
    }
    
    // Validate options
    if (options.limit && isNaN(Number(options.limit))) {
      throw BadRequest('limit must be a number');
    }
    
    if (options.offset && isNaN(Number(options.offset))) {
      throw BadRequest('offset must be a number');
    }
    
    if (options.similarityThreshold && 
        (isNaN(Number(options.similarityThreshold)) || 
         Number(options.similarityThreshold) < 0 || 
         Number(options.similarityThreshold) > 1)) {
      throw BadRequest('similarityThreshold must be a number between 0 and 1');
    }
    
    // Log the search request
    logger.info('Semantic search request', {
      context: {
        query,
        filters,
        options,
        requestId: req.id
      }
    });
    
    // Generate embeddings for the query
    const embeddings = await vectorSearchService.generateEmbeddings(query);
    
    // Perform the search
    const results = await vectorSearchService.semanticPropertySearch(
      embeddings,
      filters,
      options
    );
    
    // Return the results
    res.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
        filters,
        options
      }
    });
  } catch (error) {
    // Handle known errors
    if (error instanceof Error) {
      if (error.message.includes('pgvector extension')) {
        return next(InternalServerError('Vector search is not available', {
          details: 'The pgvector extension is not installed on the database'
        }));
      }
    }
    
    // Pass other errors to the error handler
    next(error);
  }
});

/**
 * GET /api/search/similar/:propertyId
 * Find properties similar to a reference property
 */
router.get('/similar/:propertyId', similarPropertiesLimiter, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    
    // Validate propertyId
    if (!propertyId) {
      throw BadRequest('Property ID is required');
    }
    
    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw BadRequest('limit must be a number between 1 and 50');
    }
    
    // Log the request
    logger.info('Similar properties request', {
      context: {
        propertyId,
        limit,
        requestId: req.id
      }
    });
    
    // Get similar properties
    const similarProperties = await vectorSearchService.getSimilarProperties(propertyId, limit);
    
    // Return the results
    res.json({
      success: true,
      data: {
        referencePropertyId: propertyId,
        similarProperties,
        count: similarProperties.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;