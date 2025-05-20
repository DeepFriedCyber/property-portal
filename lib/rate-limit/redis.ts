// lib/rate-limit/redis.ts
import { createClient } from 'redis';
import { RateLimitOptions, RateLimitResult } from './index';
import { winstonLogger as logger } from '../logging/winston-logger';

/**
 * Redis-based rate limiter for production use
 */
export class RedisRateLimiter {
  private options: Required<RateLimitOptions>;
  private client: ReturnType<typeof createClient>;
  private isConnected: boolean = false;
  
  /**
   * Create a new Redis rate limiter
   * @param options Rate limit options
   * @param redisUrl Redis connection URL
   */
  constructor(options: RateLimitOptions, redisUrl?: string) {
    this.options = {
      prefix: 'ratelimit:',
      enableLogging: true,
      ...options
    };
    
    // Create Redis client
    this.client = createClient({
      url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    // Set up event handlers
    this.client.on('error', (err) => {
      logger.error('Redis client error', {
        context: {
          error: err.message,
          stack: err.stack
        }
      });
      this.isConnected = false;
    });
    
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });
    
    // Connect to Redis
    this.connect();
  }
  
  /**
   * Connect to Redis
   */
  private async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.error('Failed to connect to Redis', {
          context: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  }
  
  /**
   * Check if a request is allowed
   * @param identifier Unique identifier for the client (e.g., IP address)
   * @returns Rate limit check result
   */
  async check(identifier: string): Promise<RateLimitResult> {
    // Ensure Redis is connected
    if (!this.isConnected) {
      await this.connect();
      
      // If still not connected, fall back to allowing the request
      if (!this.isConnected) {
        logger.warn('Rate limiting disabled: Redis not connected');
        return {
          success: true,
          remaining: this.options.maxRequests,
          resetIn: this.options.interval,
          total: 0
        };
      }
    }
    
    const key = `${this.options.prefix}${identifier}`;
    const now = Date.now();
    
    try {
      // Use Redis transaction to ensure atomicity
      const multi = this.client.multi();
      
      // Get current count
      multi.get(key);
      
      // Get TTL
      multi.ttl(key);
      
      // Execute transaction
      const [countStr, ttl] = await multi.exec();
      
      // Parse count or default to 0
      let count = countStr ? parseInt(countStr as string, 10) : 0;
      
      // If key doesn't exist or has expired, reset count
      if (ttl < 0) {
        count = 0;
      }
      
      // Increment count
      count++;
      
      // Calculate remaining requests and reset time
      const remaining = Math.max(0, this.options.maxRequests - count);
      const resetIn = ttl < 0 ? this.options.interval : ttl * 1000;
      const success = count <= this.options.maxRequests;
      
      // Update Redis
      await this.client.setEx(key, Math.ceil(this.options.interval / 1000), count.toString());
      
      // Log rate limit events if enabled
      if (this.options.enableLogging) {
        if (!success) {
          logger.warn('Rate limit exceeded', {
            context: {
              identifier,
              maxRequests: this.options.maxRequests,
              interval: this.options.interval,
              count
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
        total: count
      };
    } catch (error) {
      // Log error and fall back to allowing the request
      logger.error('Rate limit check failed', {
        context: {
          error: error instanceof Error ? error.message : String(error),
          identifier
        }
      });
      
      return {
        success: true,
        remaining: this.options.maxRequests,
        resetIn: this.options.interval,
        total: 0
      };
    }
  }
  
  /**
   * Reset the rate limit for a specific identifier
   * @param identifier Unique identifier for the client
   */
  async reset(identifier: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
      
      if (!this.isConnected) {
        return;
      }
    }
    
    const key = `${this.options.prefix}${identifier}`;
    
    try {
      await this.client.del(key);
      
      if (this.options.enableLogging) {
        logger.info('Rate limit reset', {
          context: {
            identifier
          }
        });
      }
    } catch (error) {
      logger.error('Failed to reset rate limit', {
        context: {
          error: error instanceof Error ? error.message : String(error),
          identifier
        }
      });
    }
  }
  
  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

/**
 * Create a new Redis rate limiter
 * @param options Rate limit options
 * @param redisUrl Redis connection URL
 * @returns Redis rate limiter instance
 */
export function redisRateLimit(options: RateLimitOptions, redisUrl?: string) {
  return new RedisRateLimiter(options, redisUrl);
}

/**
 * Express middleware for Redis-based rate limiting
 * @param options Rate limit options
 * @param redisUrl Redis connection URL
 * @returns Express middleware function
 */
export function redisRateLimitMiddleware(options: RateLimitOptions, redisUrl?: string) {
  const limiter = new RedisRateLimiter(options, redisUrl);
  
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
  redisRateLimit,
  redisRateLimitMiddleware
};