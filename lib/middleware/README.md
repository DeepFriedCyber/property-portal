# Error Handling & Logging Middleware

This directory contains middleware for structured error handling and logging in the Property Portal application.

## Features

- **Structured Error Handling**: Consistent error responses across the application
- **Request ID Tracking**: Unique ID for each request to trace through logs
- **Detailed Logging**: Context-rich logging for both successful and failed operations
- **Environment-Aware**: Different behavior in development vs. production
- **Helper Functions**: Utility functions for common error types

## Components

### 1. Error Handler Middleware

The main error handler middleware (`errorHandler.ts`) provides:

- Custom `AppError` class for application-specific errors
- Global error handling middleware
- Request ID generation and tracking
- 404 Not Found handler
- Helper functions for common error types

### 2. Middleware Setup

The `index.ts` file provides a convenient way to set up all middleware:

- Security middleware (Helmet)
- CORS configuration
- Body parsers
- Compression
- Request logging
- Error handling

## Usage

### Basic Setup

```typescript
import express from 'express';
import { setupMiddleware } from './lib/middleware';

const app = express();

// Apply all middleware
setupMiddleware(app);

// Add your routes here
app.get('/api/example', (req, res) => {
  res.json({ success: true });
});

app.listen(3000);
```

### Throwing Application Errors

```typescript
import { BadRequest, NotFound } from './lib/middleware';

app.get('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate input
    if (!id) {
      throw BadRequest('Property ID is required');
    }
    
    const property = await findProperty(id);
    
    if (!property) {
      throw NotFound(`Property with ID ${id} not found`);
    }
    
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
});
```

### Available Error Helpers

- `BadRequest(message, details)` - 400 Bad Request
- `Unauthorized(message, details)` - 401 Unauthorized
- `Forbidden(message, details)` - 403 Forbidden
- `NotFound(message, details)` - 404 Not Found
- `Conflict(message, details)` - 409 Conflict
- `InternalServerError(message, details)` - 500 Internal Server Error

### Custom Error Creation

```typescript
import { createError } from './lib/middleware';

// Create a custom error with status code 422
const validationError = createError(422, 'Validation failed', {
  fields: {
    email: 'Invalid email format',
    password: 'Password too short'
  }
});

throw validationError;
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

## Best Practices

1. **Always use `next(error)` to pass errors to the middleware**
2. **Use the provided error helpers for common error types**
3. **Include meaningful details in error objects**
4. **Use try/catch blocks in async route handlers**
5. **Don't expose sensitive information in error details**