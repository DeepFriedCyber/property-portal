"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = createRateLimiter;
exports.createRateLimitMiddleware = createRateLimitMiddleware;
// lib/rate-limit/factory.ts
const winston_logger_1 = require("../logging/winston-logger");
const redis_1 = require("./redis");
const index_1 = require("./index");
/**
 * Create a rate limiter based on the environment
 * @param options Rate limit options
 * @returns Rate limiter instance
 */
function createRateLimiter(options) {
    // Use Redis in production, in-memory in development
    const useRedis = process.env.NODE_ENV === 'production' || process.env.USE_REDIS === 'true';
    if (useRedis) {
        winston_logger_1.winstonLogger.info('Using Redis-based rate limiter');
        return (0, redis_1.redisRateLimit)(options);
    }
    else {
        winston_logger_1.winstonLogger.info('Using in-memory rate limiter');
        return (0, index_1.rateLimit)(options);
    }
}
/**
 * Create a rate limit middleware based on the environment
 * @param options Rate limit options
 * @returns Express middleware function
 */
function createRateLimitMiddleware(options) {
    const useRedis = process.env.NODE_ENV === 'production' || process.env.USE_REDIS === 'true';
    if (useRedis) {
        const { redisRateLimitMiddleware } = require('./redis');
        return redisRateLimitMiddleware(options);
    }
    else {
        const { rateLimitMiddleware } = require('./index');
        return rateLimitMiddleware(options);
    }
}
exports.default = {
    createRateLimiter,
    createRateLimitMiddleware,
};
