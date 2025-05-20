// lib/rate-limit/factory.ts
import { winstonLogger as logger } from '../logging/winston-logger'

import { redisRateLimit } from './redis'

import { RateLimitOptions, rateLimit } from './index'

/**
 * Create a rate limiter based on the environment
 * @param options Rate limit options
 * @returns Rate limiter instance
 */
export function createRateLimiter(options: RateLimitOptions) {
  // Use Redis in production, in-memory in development
  const useRedis = process.env.NODE_ENV === 'production' || process.env.USE_REDIS === 'true'

  if (useRedis) {
    logger.info('Using Redis-based rate limiter')
    return redisRateLimit(options)
  } else {
    logger.info('Using in-memory rate limiter')
    return rateLimit(options)
  }
}

/**
 * Create a rate limit middleware based on the environment
 * @param options Rate limit options
 * @returns Express middleware function
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  const useRedis = process.env.NODE_ENV === 'production' || process.env.USE_REDIS === 'true'

  if (useRedis) {
    const { redisRateLimitMiddleware } = require('./redis')
    return redisRateLimitMiddleware(options)
  } else {
    const { rateLimitMiddleware } = require('./index')
    return rateLimitMiddleware(options)
  }
}

export default {
  createRateLimiter,
  createRateLimitMiddleware,
}
