# Enhanced Error Handling & Logging System

This document describes the enhanced error handling and logging system implemented in the Property Portal application.

## Overview

The system provides:

1. **Structured Error Handling**: Consistent error responses across the application
2. **Request ID Tracking**: Unique ID for each request to trace through logs
3. **Detailed Logging**: Context-rich logging for both successful and failed operations
4. **Environment-Aware Behavior**: Different behavior in development vs. production
5. **Helper Functions**: Utility functions for common error types

## Components

### 1. Error Handler Middleware (`lib/middleware/errorHandler.ts`)

- **AppError Class**: Custom error class with status code and details
- **Request ID Middleware**: Adds unique ID to each request
- **Error Handler Middleware**: Processes errors and returns consistent responses
- **Not Found Handler**: Handles 404 errors for routes that don't exist
- **Error Helper Functions**: Shortcuts for common error types (BadRequest, Unauthorized, etc.)

### 2. Middleware Setup (`lib/middleware/index.ts`)

Configures all middleware in one place:
- Security middleware (Helmet)
- CORS configuration
- Body parsers
- Compression
- Request logging
- Error handling

### 3. Logger Integration

The logging system has been integrated with the error handling middleware:

#### Winston Logger (`lib/logging/winston-logger.ts`)

A robust server-side logger based on Winston:
- Console output with colorized, human-readable format
- File output with JSON format for machine processing
- Automatic log rotation and size limits
- Separate files for errors, rejections, and exceptions
- Sanitization of sensitive data

#### Advanced Winston Logger (`lib/logging/advanced-winston-logger.ts`)

An enhanced version with daily rotation:
- Daily log rotation with date-based filenames
- Compressed archives of old logs
- Size-based rotation (20MB max file size)
- Retention policies (14 days for combined logs, 30 days for error logs)
- Error handling for transport failures

#### Integration Features

- Request context in logs (path, method, request ID)
- Error details and stack traces
- Request ID tracking through the entire request lifecycle
- Sensitive data redaction
- Environment-aware logging levels

## Usage Examples

### 1. Basic Error Handling

```typescript
app.get('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await findProperty(id);
    
    if (!property) {
      throw NotFound(`Property with ID ${id} not found`);
    }
    
    res.json({ success: true, data: property });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
});
```

### 2. Validation Errors

```typescript
app.post('/api/properties', (req, res, next) => {
  try {
    const { title, price } = req.body;
    
    if (!title) {
      throw BadRequest('Title is required');
    }
    
    if (!price || isNaN(price) || price <= 0) {
      throw BadRequest('Valid price is required', { 
        providedPrice: price,
        message: 'Price must be a positive number'
      });
    }
    
    // Process the request...
  } catch (error) {
    next(error);
  }
});
```

### 3. Authorization Errors

```typescript
app.put('/api/properties/:id', async (req, res, next) => {
  try {
    // Check authentication
    if (!req.user) {
      throw Unauthorized('Authentication required');
    }
    
    // Check authorization
    if (property.createdBy !== req.user.id && req.user.role !== 'admin') {
      throw Forbidden('You do not have permission to update this property');
    }
    
    // Process the request...
  } catch (error) {
    next(error);
  }
});
```

## Error Response Format

All errors are returned in a consistent JSON format:

```json
{
  "error": {
    "message": "Property with ID 123 not found",
    "details": { "propertyId": "123" },
    "timestamp": "2023-06-15T12:34:56.789Z",
    "requestId": "abc123def456"
  }
}
```

## Request ID Tracking

Each request receives a unique ID that is:

1. Added to the request object as `req.id`
2. Included in response headers as `X-Request-ID`
3. Included in all log entries related to the request
4. Returned in error responses for debugging

This makes it easy to trace a request through logs and troubleshoot issues reported by users.

## Implementation Details

### Files Created/Modified

1. `lib/middleware/errorHandler.ts` - Core error handling functionality
2. `lib/middleware/express.d.ts` - TypeScript declarations for Express
3. `lib/middleware/index.ts` - Middleware setup and exports
4. `lib/middleware/README.md` - Documentation for the middleware
5. `lib/logging/winston-logger.ts` - Winston-based logger
6. `lib/logging/advanced-winston-logger.ts` - Enhanced logger with daily rotation
7. `lib/logging/README.md` - Documentation for the logging system
8. `apps/api/src/server.ts` - API server setup with middleware
9. `apps/api/src/routes/properties.ts` - Example route with error handling
10. `apps/api/src/routes/users.ts` - Example route with error handling
11. `apps/api/src/index.ts` - Updated API entry point
12. `examples/error-handling-example.ts` - Usage example
13. `docs/enhanced-error-handling.md` - This documentation

### Dependencies Added

- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing middleware
- `helmet` - Security middleware
- `compression` - Response compression middleware
- `winston` - Logging library
- `winston-daily-rotate-file` - Log rotation for Winston
- `express-winston` - Winston integration for Express
- `uuid` - For generating unique IDs

## Best Practices

1. **Always use `next(error)` to pass errors to the middleware**
2. **Use the provided error helpers for common error types**
3. **Include meaningful details in error objects**
4. **Use try/catch blocks in async route handlers**
5. **Don't expose sensitive information in error details**
6. **Log at the appropriate level (info, warn, error)**
7. **Include request context in logs**

## Next Steps

1. **Add Request Validation Middleware**: Implement middleware using a validation library like Zod or Joi
2. **Add Rate Limiting**: Protect against abuse with rate limiting middleware
3. **Add Monitoring**: Integrate with monitoring tools to track error rates
4. **Add Alerting**: Set up alerts for critical errors
5. **Add Error Aggregation**: Integrate with error tracking services like Sentry