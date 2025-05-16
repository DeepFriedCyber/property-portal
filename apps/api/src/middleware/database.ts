// database.ts
import { isDatabaseHealthy, getDatabaseStatus } from '@your-org/db';
import {
  DatabaseConnectionError,
  DatabaseQueryError,
  DatabaseConstraintError,
  DatabaseTimeoutError,
} from '@your-org/db/error-handler';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check database health before processing requests
 */
export function databaseHealthCheck(req: Request, res: Response, next: NextFunction) {
  // Skip health check endpoint
  if (req.path === '/health' || req.path.startsWith('/health/')) {
    return next();
  }

  if (!isDatabaseHealthy()) {
    const status = getDatabaseStatus();

    // Return 503 Service Unavailable
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database service is currently unavailable',
        code: 'DATABASE_UNAVAILABLE',
        details: {
          status: status.status,
          error: status.error ? status.error.message : null,
        },
      },
    });
  }

  next();
}

/**
 * Error handler middleware for database errors
 */
export function databaseErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Handle database connection errors
  if (err instanceof DatabaseConnectionError) {
    console.error('Database connection error:', err);
    return res.status(503).json({
      success: false,
      error: {
        message: 'Database connection error',
        code: 'DATABASE_CONNECTION_ERROR',
      },
    });
  }

  // Handle database constraint errors
  if (err instanceof DatabaseConstraintError) {
    console.error('Database constraint error:', err);
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database constraint violation',
        code: 'DATABASE_CONSTRAINT_ERROR',
        details: {
          constraint: err.constraint,
        },
      },
    });
  }

  // Handle database timeout errors
  if (err instanceof DatabaseTimeoutError) {
    console.error('Database timeout error:', err);
    return res.status(504).json({
      success: false,
      error: {
        message: 'Database operation timed out',
        code: 'DATABASE_TIMEOUT_ERROR',
      },
    });
  }

  // Handle database query errors
  if (err instanceof DatabaseQueryError) {
    console.error('Database query error:', err);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Database query error',
        code: 'DATABASE_QUERY_ERROR',
      },
    });
  }

  // Pass other errors to the next error handler
  next(err);
}
