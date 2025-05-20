# Error Handling & Logging

This document outlines the error handling and logging system implemented in the Property Portal application.

## Error Handling

The application uses a centralized error handling system to ensure consistent error responses across all API endpoints.

### Error Classes

The following error classes are available for use throughout the application:

- `APIError`: Base error class for all API errors
- `ValidationError`: For handling invalid input data (400 Bad Request)
- `UnauthorizedError`: For handling authentication issues (401 Unauthorized)
- `ForbiddenError`: For handling permission issues (403 Forbidden)
- `NotFoundError`: For handling missing resources (404 Not Found)

### Usage in API Routes

API routes should use the `withErrorHandling` wrapper to automatically handle errors:

```typescript
import { withErrorHandling, ValidationError } from '@/lib/api'

export const GET = withErrorHandling(async request => {
  // Your API logic here

  // Throw specific errors when needed
  if (!isValid) {
    throw new ValidationError('Invalid data', { details: 'Specific error details' })
  }

  // Return response normally
  return NextResponse.json({ data: 'Your data' })
})
```

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "message": "Error message",
    "details": {
      // Optional additional error details
    }
  }
}
```

## Logging

The application uses Winston for logging, configured to output different levels of logs based on the environment.

### Log Levels

- `error`: For critical errors that require immediate attention
- `warn`: For potential issues that don't prevent the application from working
- `info`: For important application events
- `debug`: For detailed debugging information (only in development)

### Usage

```typescript
import { logger } from '@/lib/api'

// Log different levels
logger.error('Critical error occurred', { error, additionalContext })
logger.warn('Potential issue', { details })
logger.info('User logged in', { userId })
logger.debug('Processing request', { requestData })
```

### Log Output

In development, logs are output to the console with colors for different levels.

In production, logs are:

1. Output to the console
2. Written to `logs/combined.log` for all logs
3. Written to `logs/error.log` for error logs only

### Request Logging

All API requests are automatically logged by the middleware with:

- Request method and path
- Query parameters
- User agent
- Referer
- Unique request ID (also returned in the `X-Request-ID` header)

## Best Practices

1. **Use specific error classes** for different error scenarios
2. **Include relevant context** in error messages and logs
3. **Don't log sensitive information** like passwords or tokens
4. **Use appropriate log levels** based on the severity of the event
5. **Add context objects** to logs for better debugging
6. **Wrap API handlers** with `withErrorHandling` for consistent error handling
