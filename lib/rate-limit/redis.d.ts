import { RateLimitOptions, RateLimitResult } from './index';
/**
 * Redis-based rate limiter for production use
 */
export declare class RedisRateLimiter {
    private options;
    private client;
    private isConnected;
    /**
     * Create a new Redis rate limiter
     * @param options Rate limit options
     * @param redisUrl Redis connection URL
     */
    constructor(options: RateLimitOptions, redisUrl?: string);
    /**
     * Connect to Redis
     */
    private connect;
    /**
     * Check if a request is allowed
     * @param identifier Unique identifier for the client (e.g., IP address)
     * @returns Rate limit check result
     */
    check(identifier: string): Promise<RateLimitResult>;
    /**
     * Reset the rate limit for a specific identifier
     * @param identifier Unique identifier for the client
     */
    reset(identifier: string): Promise<void>;
    /**
     * Close the Redis connection
     */
    close(): Promise<void>;
}
/**
 * Create a new Redis rate limiter
 * @param options Rate limit options
 * @param redisUrl Redis connection URL
 * @returns Redis rate limiter instance
 */
export declare function redisRateLimit(options: RateLimitOptions, redisUrl?: string): RedisRateLimiter;
/**
 * Express middleware for Redis-based rate limiting
 * @param options Rate limit options
 * @param redisUrl Redis connection URL
 * @returns Express middleware function
 */
export declare function redisRateLimitMiddleware(options: RateLimitOptions, redisUrl?: string): (req: any, res: any, next: any) => Promise<any>;
declare const _default: {
    redisRateLimit: typeof redisRateLimit;
    redisRateLimitMiddleware: typeof redisRateLimitMiddleware;
};
export default _default;
//# sourceMappingURL=redis.d.ts.map