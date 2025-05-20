// lib/middleware/errorHandler.ts
import { NextFunction, Request, Response } from 'express';
import { winstonLogger as logger } from '../logging/winston-logger';

/**
 * Custom application error class with additional context
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Generate a unique request ID
 * @returns A unique ID string
 */
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

/**
 * Middleware to add a unique ID to each request
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate a unique request ID if not already present
  req.id = req.id || generateRequestId();
  
  // Add the request ID to response headers for debugging
  res.setHeader('X-Request-ID', req.id);
  
  next();
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If headers already sent, let the default Express error handler deal with it
  if (res.headersSent) {
    return next(err);
  }

  // Handle known application errors
  if (err instanceof AppError) {
    logger.warn(`Handled error: ${err.message}`, {
      context: {
        path: req.path,
        method: req.method,
        requestId: req.id,
        details: err.details
      }
    });

    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
  }

  // Handle unexpected errors
  logger.error(`Unhandled error: ${err.message}`, {
    context: {
      stack: err.stack,
      path: req.path,
      method: req.method,
      requestId: req.id,
      body: req.body
    }
  });

  // In production, don't expose error details to clients
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    error: {
      message: isProduction ? 'Internal Server Error' : err.message,
      requestId: req.id,
      timestamp: new Date().toISOString(),
      // Only include stack trace in non-production environments
      ...(isProduction ? {} : { stack: err.stack })
    }
  });
}

/**
 * Middleware to handle 404 Not Found errors
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.info(`Route not found: ${req.method} ${req.path}`, {
    context: {
      path: req.path,
      method: req.method,
      requestId: req.id
    }
  });

  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      requestId: req.id,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Helper function to create an AppError
 * @param statusCode HTTP status code
 * @param message Error message
 * @param details Additional error details
 * @returns AppError instance
 */
export function createError(
  statusCode: number,
  message: string,
  details?: Record<string, unknown>
): AppError {
  return new AppError(statusCode, message, details);
}

// Common error creators
export const BadRequest = (message = 'Bad Request', details?: Record<string, unknown>) => 
  createError(400, message, details);

export const Unauthorized = (message = 'Unauthorized', details?: Record<string, unknown>) => 
  createError(401, message, details);

export const Forbidden = (message = 'Forbidden', details?: Record<string, unknown>) => 
  createError(403, message, details);

export const NotFound = (message = 'Not Found', details?: Record<string, unknown>) => 
  createError(404, message, details);

export const Conflict = (message = 'Conflict', details?: Record<string, unknown>) => 
  createError(409, message, details);

export const InternalServerError = (message = 'Internal Server Error', details?: Record<string, unknown>) => 
  createError(500, message, details);