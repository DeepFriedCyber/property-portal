# Logging System

This directory contains the logging system for the Property Portal application.

## Overview

The logging system provides:

1. **Structured Logging**: JSON-formatted logs with consistent structure
2. **Multiple Log Levels**: Debug, Info, Warn, Error, Fatal
3. **Multiple Outputs**: Console and file-based logging
4. **Request Context**: Automatic inclusion of request ID and other context
5. **Sensitive Data Redaction**: Automatic redaction of sensitive information
6. **Error Tracking**: Integration with error handling middleware

## Components

### 1. Winston Logger (`winston-logger.ts`)

The primary server-side logger based on Winston:

- Console output with colorized, human-readable format
- File output with JSON format for machine processing
- Automatic log rotation and size limits
- Separate files for errors, rejections, and exceptions
- Sanitization of sensitive data

### 2. Advanced Winston Logger (`advanced-winston-logger.ts`)

An enhanced version of the Winston logger with daily rotation:

- Daily log rotation with date-based filenames
- Compressed archives of old logs
- Size-based rotation (20MB max file size)
- Retention policies (14 days for combined logs, 30 days for error logs)
- Error handling for transport failures

### 3. Simplified Logger (`simplified-logger.ts`)

A lightweight logger for client-side use:

- Browser-compatible logging
- Integration with Sentry and LogRocket
- Environment-aware behavior
- User and request tracking

## Usage

### Basic Logging

```typescript
import { winstonLogger as logger } from './lib/logging/winston-logger'

// Log at different levels
logger.debug('Detailed debug information')
logger.info('Something noteworthy happened')
logger.warn('Something concerning happened')
logger.error('Something went wrong', new Error('Error details'))
```

### Logging with Context

```typescript
logger.info('User registered', {
  context: {
    userId: 'user-123',
    email: 'user@example.com',
    plan: 'premium',
  },
})
```

### Request-Aware Logging

```typescript
import { loggerWithRequest } from './lib/logging/winston-logger'

app.get('/api/properties', (req, res) => {
  const reqLogger = loggerWithRequest(req)

  reqLogger.info('Fetching properties', {
    filters: req.query,
  })

  // The request ID, path, and method are automatically included
})
```

## Log Files

Logs are stored in the `logs` directory:

- `combined.log` - All log entries
- `error.log` - Error-level logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## Configuration

The logger can be configured through environment variables:

- `LOG_LEVEL` - Minimum log level (default: 'info')
- `NODE_ENV` - Environment ('development', 'test', 'production')

## Integration with Error Handling

The logging system is integrated with the error handling middleware:

```typescript
import { BadRequest } from './lib/middleware/errorHandler'
import { winstonLogger as logger } from './lib/logging/winston-logger'

app.post('/api/properties', (req, res, next) => {
  try {
    logger.info('Creating property', { body: req.body })

    if (!req.body.title) {
      throw BadRequest('Title is required')
    }

    // Process request...
  } catch (error) {
    // The error handler middleware will log the error
    next(error)
  }
})
```

## Best Practices

1. **Use the appropriate log level**

   - Debug: Detailed information for debugging
   - Info: Normal application behavior
   - Warn: Concerning but non-critical issues
   - Error: Application errors that need attention
   - Fatal: Critical errors that may cause application failure

2. **Include relevant context**

   - Add enough information to understand the log entry
   - Don't include sensitive information
   - Don't log entire objects without sanitization

3. **Use structured logging**

   - Use the context parameter instead of string concatenation
   - This makes logs easier to search and analyze

4. **Log at service boundaries**

   - Log when entering and leaving important functions
   - Log before and after external service calls
   - Log database operations

5. **Include request IDs**
   - Use the loggerWithRequest helper to automatically include request context
