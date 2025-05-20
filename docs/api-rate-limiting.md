# API Rate Limiting

This document describes the rate limiting implementation for the Property Portal API.

## Overview

Rate limiting is implemented to:

1. **Prevent Abuse**: Protect the API from malicious or unintentional abuse
2. **Ensure Fair Usage**: Distribute resources fairly among all users
3. **Optimize Performance**: Maintain optimal performance during high traffic
4. **Reduce Costs**: Control resource usage in cloud environments

## Implementation

The Property Portal uses a tiered approach to rate limiting:

### 1. Global Rate Limiting

All API requests are subject to a global rate limit:

```typescript
// Global rate limit: 200 requests per minute
const globalRateLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 200,    // 200 requests per minute
  prefix: 'ratelimit:global:',
});

app.use(globalRateLimiter);
```

### 2. Resource-Specific Rate Limiting

Different API resources have different rate limits based on their resource requirements:

#### Search API

```typescript
// Semantic search: 20 requests per minute
const semanticSearchLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 20,     // 20 requests per minute
  prefix: 'ratelimit:semantic:',
});

// Similar properties search: 50 requests per minute
const similarPropertiesLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 50,     // 50 requests per minute
  prefix: 'ratelimit:similar:',
});
```

#### Properties API

```typescript
// Read operations: 100 requests per minute
const readLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100,    // 100 requests per minute
  prefix: 'ratelimit:properties:read:',
});

// Write operations: 30 requests per minute
const writeLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 30,     // 30 requests per minute
  prefix: 'ratelimit:properties:write:',
});
```

#### Users API

```typescript
// Profile operations: 30 requests per minute
const profileLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 30,     // 30 requests per minute
  prefix: 'ratelimit:users:profile:',
});
```

## Rate Limit Headers

When a request is made, the following headers are included in the response:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the current interval
- `X-RateLimit-Remaining`: Number of requests remaining in the current interval
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

Example:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 45
```

## Rate Limit Exceeded Response

When a rate limit is exceeded, the API returns a `429 Too Many Requests` response with the following JSON body:

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

## Client Identification

Rate limits are applied based on client identification. The system uses the following sources to identify clients, in order of preference:

1. `x-real-ip` header
2. `x-forwarded-for` header
3. Request IP address
4. If no identifier can be determined, the client is treated as 'anonymous'

## Storage Backends

The rate limiting system supports two storage backends:

### 1. In-Memory Storage

Used in development and testing environments. Rate limit data is stored in memory using a Map.

Pros:
- No external dependencies
- Simple setup

Cons:
- Not suitable for distributed environments
- Data is lost on server restart

### 2. Redis Storage

Used in production environments. Rate limit data is stored in Redis.

Pros:
- Works in distributed environments
- Persists across server restarts
- Automatic key expiration

Cons:
- Requires Redis server
- More complex setup

## Configuration

The rate limiting system can be configured through environment variables:

- `NODE_ENV`: Set to 'production' to use Redis storage
- `USE_REDIS`: Set to 'true' to force Redis storage regardless of environment
- `REDIS_URL`: Redis connection URL (default: 'redis://localhost:6379')

## Best Practices for API Consumers

1. **Implement Caching**: Cache responses to reduce the number of API calls
2. **Use Bulk Operations**: Use bulk endpoints where available instead of making multiple requests
3. **Handle Rate Limit Errors**: Implement exponential backoff when receiving 429 responses
4. **Monitor Usage**: Track your API usage to avoid hitting rate limits
5. **Optimize Requests**: Only request the data you need

## Implementation Details

The rate limiting system is implemented in the `lib/rate-limit` directory:

- `index.ts`: In-memory rate limiter implementation
- `redis.ts`: Redis-based rate limiter implementation
- `factory.ts`: Factory function to choose the appropriate implementation

The system uses middleware to apply rate limits to routes:

```typescript
router.post('/semantic', semanticSearchLimiter, async (req, res, next) => {
  // Route handler
});
```

## Future Improvements

1. **User-Based Rate Limiting**: Different rate limits for different user tiers
2. **Dynamic Rate Limiting**: Adjust rate limits based on server load
3. **Rate Limit Dashboard**: Admin dashboard to monitor and adjust rate limits
4. **IP Allowlisting**: Allow certain IPs to bypass rate limits
5. **Token Bucket Algorithm**: More sophisticated rate limiting algorithm