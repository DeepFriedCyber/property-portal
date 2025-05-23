// middleware/error-handler.ts
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// Define standard API error response format
export interface ApiErrorResponse {
  status: 'error';
  code: number;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId?: string;
}

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;
  
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
  
  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }
  
  static unauthorized(message: string = 'Unauthorized', details?: unknown): ApiError {
    return new ApiError(401, message, details);
  }
  
  static forbidden(message: string = 'Forbidden', details?: unknown): ApiError {
    return new ApiError(403, message, details);
  }
  
  static notFound(message: string = 'Resource not found', details?: unknown): ApiError {
    return new ApiError(404, message, details);
  }
  
  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }
  
  static internalServer(message: string = 'Internal server error', details?: unknown): ApiError {
    return new ApiError(500, message, details);
  }
}

// Error handler middleware
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate a unique request ID if not already present
  const requestId = req.headers['x-request-id'] as string || Math.random().toString(36).substring(2, 15);
  
  // Log the error
  console.error(`[Error] [${requestId}]`, {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  
  // Prepare the error response
  const errorResponse: ApiErrorResponse = {
    status: 'error',
    code: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId,
  };
  
  // Handle different types of errors
  if (err instanceof ApiError) {
    errorResponse.code = err.statusCode;
    errorResponse.message = err.message;
    errorResponse.details = err.details;
  } else if (err instanceof ZodError) {
    // Handle validation errors
    errorResponse.code = 400;
    errorResponse.message = 'Validation error';
    errorResponse.details = err.errors;
  } else if (err.name === 'UnauthorizedError') {
    // Handle JWT authentication errors
    errorResponse.code = 401;
    errorResponse.message = 'Unauthorized: Invalid token';
  } else if (err.name === 'ValidationError') {
    // Handle mongoose validation errors
    errorResponse.code = 400;
    errorResponse.message = 'Validation error';
    errorResponse.details = err.message;
  }
  
  // Send the error response
  res.status(errorResponse.code).json(errorResponse);
}

// Not found handler middleware
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ApiErrorResponse = {
    status: 'error',
    code: 404,
    message: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId: req.headers['x-request-id'] as string || Math.random().toString(36).substring(2, 15),
  };
  
  res.status(404).json(errorResponse);
}