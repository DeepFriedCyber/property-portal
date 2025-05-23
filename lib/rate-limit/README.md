# Rate Limiting Library

This library provides rate limiting functionality for the Property Portal API.

## Features

- **In-memory rate limiting** for development and testing
- **Redis-based rate limiting** for production use
- **Express middleware** for easy integration
- **Configurable limits** based on time windows and request counts
- **Automatic header generation** for rate limit information
- **Logging integration** for monitoring and debugging

## Usage

### Basic Usage

```typescript
import { rateLimit } from '@/lib/rate-limit'

// Create a rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute
})

// Check if a request is allowed
const { success, remaining, resetIn } = await limiter.check('user-ip-address')

if (!success) {
  // Handle rate limit exceeded
}
```

### Express Middleware

```typescript
import express from 'express'
import { rateLimitMiddleware } from '@/lib/rate-limit'

const app = express()

// Apply rate limiting to all routes
app.use(
  rateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  })
)

// Or apply to specific routes
app.use(
  '/api/search',
  rateLimitMiddleware({
    interval: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  })
)
```

### Redis-based Rate Limiting

```typescript
import { redisRateLimit } from '@/lib/rate-limit/redis'

// Create a Redis-based rate limiter
const limiter = redisRateLimit(
  {
    interval: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  },
  'redis://localhost:6379'
) // Optional Redis URL

// Check if a request is allowed
const result = await limiter.check('user-ip-address')
```

### Environment-based Factory

```typescript
import { createRateLimiter, createRateLimitMiddleware } from '@/lib/rate-limit/factory'

// Create the appropriate rate limiter based on the environment
const limiter = createRateLimiter({
  interval: 60 * 1000,
  maxRequests: 20,
})

// Create the appropriate middleware based on the environment
const middleware = createRateLimitMiddleware({
  interval: 60 * 1000,
  maxRequests: 20,
})
```

## Configuration Options

The rate limiter accepts the following options:

| Option          | Type    | Description                                        | Default        |
| --------------- | ------- | -------------------------------------------------- | -------------- |
| `interval`      | number  | Time window in milliseconds                        | -              |
| `maxRequests`   | number  | Maximum number of requests allowed in the interval | -              |
| `prefix`        | string  | Prefix for the cache key                           | `'ratelimit:'` |
| `enableLogging` | boolean | Whether to log rate limit events                   | `true`         |

## Response Headers

When using the middleware, the following headers are automatically added to responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the current interval
- `X-RateLimit-Remaining`: Number of requests remaining in the current interval
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

## Error Response

When a rate limit is exceeded, the middleware returns a 429 Too Many Requests response with the following JSON body:

```json
{
  "error": {
    "message": "Too many requests, please try again later",
    "details": {
      "retryAfter": 30
    }
  }
}
```

## Implementation Details

### In-memory Rate Limiter

The in-memory rate limiter uses a Map to store rate limit data. This is suitable for development and testing, but not for production environments with multiple server instances.

### Redis Rate Limiter

The Redis-based rate limiter uses Redis to store rate limit data, making it suitable for production environments with multiple server instances. It requires a Redis server to be available.

### Cleanup

The in-memory rate limiter automatically cleans up old entries every 10 minutes to prevent memory leaks. Entries older than 1 hour are removed.

The Redis-based rate limiter uses Redis's built-in expiration mechanism to automatically clean up old entries.

## Best Practices

1. **Use different limits for different endpoints** based on their resource requirements
2. **Use Redis in production** for distributed rate limiting
3. **Monitor rate limit events** to identify potential abuse
4. **Adjust limits based on usage patterns** to balance user experience and server load
5. **Include retry-after information** in error responses to help clients handle rate limiting gracefully
