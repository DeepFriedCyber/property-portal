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
 * Rate limiter class
 */
export declare class RateLimiter {
    private options;
    /**
     * Create a new rate limiter
     * @param options Rate limit options
     */
    constructor(options: RateLimitOptions);
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
    reset(identifier: string): void;
}
/**
 * Create a new rate limiter
 * @param options Rate limit options
 * @returns Rate limiter instance
 */
export declare function rateLimit(options: RateLimitOptions): RateLimiter;
/**
 * Express middleware for rate limiting
 * @param options Rate limit options
 * @returns Express middleware function
 */
export declare function rateLimitMiddleware(options: RateLimitOptions): (req: any, res: any, next: any) => Promise<any>;
declare const _default: {
    rateLimit: typeof rateLimit;
    rateLimitMiddleware: typeof rateLimitMiddleware;
};
export default _default;
//# sourceMappingURL=index.d.ts.map