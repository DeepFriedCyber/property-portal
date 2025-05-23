import { RateLimitOptions } from './index';
/**
 * Create a rate limiter based on the environment
 * @param options Rate limit options
 * @returns Rate limiter instance
 */
export declare function createRateLimiter(options: RateLimitOptions): import("./index").RateLimiter | import("./redis").RedisRateLimiter;
/**
 * Create a rate limit middleware based on the environment
 * @param options Rate limit options
 * @returns Express middleware function
 */
export declare function createRateLimitMiddleware(options: RateLimitOptions): any;
declare const _default: {
    createRateLimiter: typeof createRateLimiter;
    createRateLimitMiddleware: typeof createRateLimitMiddleware;
};
export default _default;
//# sourceMappingURL=factory.d.ts.map