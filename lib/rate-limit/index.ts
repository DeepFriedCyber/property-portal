// lib/rate-limit/index.ts
import { winstonLogger as logger } from '../logging/winston-logger';

/**
 * Interface for rate limit options
 */
export interface RateLimitOptions {
  /**
   * Time window in milliseconds
   */
  interval: number;
  
  /**
   * Maximum number of requests allowed in the interval
   */
  maxRequests: number;
  
  /**
   * Optional prefix for the cache key
   */
  prefix?: string;
  
  /**
   * Whether to log rate limit events
   */
  enableLogging?: boolean;
}

/**
 * Interface for rate limit check result
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean;
  
  /**
   * Number of remaining requests in the current interval
   */
  remaining: number;
  
  /**
   * Time in milliseconds until the rate limit resets
   */
  resetIn: number;
  
  /**
   * Total number of requests made in the current interval
   */
  total: number;
}

/**
 * In-memory store for rate limit data
 */
const store = new Map<string, { count: number; timestamp: number }>();

/**
 * Cleanup old entries periodically
 */
const cleanupInterval = 10 * 60 * 1000; // 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    // Remove entries older than 1 hour
    if (now - data.timestamp > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, cleanupInterval);

/**
 * Rate limiter class
 */
export class RateLimiter {
  private options: Required<RateLimitOptions>;
  
  /**
   * Create a new rate limiter
   * @param options Rate limit options
   */
  constructor(options: RateLimitOptions) {
    this.options = {
      prefix: 'ratelimit:',
      enableLogging: true,
      ...options
    };
  }
  
  /**
   * Check if a request is allowed
   * @param identifier Unique identifier for the client (e.g., IP address)
   * @returns Rate limit check result
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.options.prefix}${identifier}`;
    const now = Date.now();
    
    // Get current data or create new entry
    const current = store.get(key) || { count: 0, timestamp: now };
    
    // Check if the interval has passed and reset if needed
    if (now - current.timestamp > this.options.interval) {
      current.count = 0;
      current.timestamp = now;
    }
    
    // Increment the counter
    current.count++;
    
    // Calculate remaining requests and reset time
    const remaining = Math.max(0, this.options.maxRequests - current.count);
    const resetIn = this.options.interval - (now - current.timestamp);
    const success = current.count <= this.options.maxRequests;
    
    // Update the store
    store.set(key, current);
    
    // Log rate limit events if enabled
    if (this.options.enableLogging) {
      if (!success) {
        logger.warn('Rate limit exceeded', {
          context: {
            identifier,
            maxRequests: this.options.maxRequests,
            interval: this.options.interval,
            count: current.count
          }
        });
      } else if (remaining < 5) {
        logger.info('Rate limit approaching', {
          context: {
            identifier,
            maxRequests: this.options.maxRequests,
            remaining,
            resetIn
          }
        });
      }
    }
    
    return {
      success,
      remaining,
      resetIn,
      total: current.count
    };
  }
  
  /**
   * Reset the rate limit for a specific identifier
   * @param identifier Unique identifier for the client
   */
  reset(identifier: string): void {
    const key = `${this.options.prefix}${identifier}`;
    store.delete(key);
    
    if (this.options.enableLogging) {
      logger.info('Rate limit reset', {
        context: {
          identifier
        }
      });
    }
  }
}

/**
 * Create a new rate limiter
 * @param options Rate limit options
 * @returns Rate limiter instance
 */
export function rateLimit(options: RateLimitOptions): RateLimiter {
  return new RateLimiter(options);
}

/**
 * Express middleware for rate limiting
 * @param options Rate limit options
 * @returns Express middleware function
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  const limiter = new RateLimiter(options);
  
  return async (req: any, res: any, next: any) => {
    // Get client identifier (IP address or user ID)
    const identifier = req.ip || 
                      req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress || 
                      'anonymous';
    
    // Check rate limit
    const result = await limiter.check(identifier);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetIn / 1000).toString());
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (!result.success) {
      return res.status(429).json({
        error: {
          message: 'Too many requests, please try again later',
          details: {
            retryAfter: Math.ceil(result.resetIn / 1000)
          }
        }
      });
    }
    
    // Continue to the next middleware
    next();
  };
}

export default {
  rateLimit,
  rateLimitMiddleware
};