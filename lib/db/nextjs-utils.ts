// db/nextjs-utils.ts
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseHealthy, getDatabaseStatus, withDatabase } from './index';
import { 
  DatabaseConnectionError, 
  DatabaseQueryError, 
  DatabaseConstraintError, 
  DatabaseTimeoutError 
} from './error-handler';

/**
 * Type for API response
 */
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

/**
 * Create a successful API response
 * @param data The data to include in the response
 * @returns A NextResponse with standardized format
 */
export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data
  });
}

/**
 * Create an error API response
 * @param message Error message
 * @param status HTTP status code
 * @param code Optional error code
 * @param details Optional error details
 * @returns A NextResponse with standardized format
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details })
      }
    },
    { status }
  );
}

/**
 * HTTP status codes for common API responses
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Check database health before processing requests
 * @param req Next.js request
 * @returns NextResponse if database is unhealthy, null otherwise
 */
export function checkDatabaseHealth(req: NextRequest): NextResponse | null {
  // Skip health check endpoint
  if (req.nextUrl.pathname === '/api/health' || req.nextUrl.pathname.startsWith('/api/health/')) {
    return null;
  }
  
  if (!isDatabaseHealthy()) {
    const status = getDatabaseStatus();
    
    // Return 503 Service Unavailable
    return errorResponse(
      'Database service is currently unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
      'DATABASE_UNAVAILABLE',
      {
        status: status.status,
        error: status.error ? status.error.message : null
      }
    );
  }
  
  return null;
}

/**
 * Handle database errors in Next.js API routes
 * @param error The error to handle
 * @returns NextResponse with appropriate error details
 */
export function handleDatabaseError(error: unknown): NextResponse {
  // Handle database connection errors
  if (error instanceof DatabaseConnectionError) {
    console.error('Database connection error:', error);
    return errorResponse(
      'Database connection error',
      HttpStatus.SERVICE_UNAVAILABLE,
      'DATABASE_CONNECTION_ERROR'
    );
  }
  
  // Handle database constraint errors
  if (error instanceof DatabaseConstraintError) {
    console.error('Database constraint error:', error);
    return errorResponse(
      'Database constraint violation',
      HttpStatus.BAD_REQUEST,
      'DATABASE_CONSTRAINT_ERROR',
      {
        constraint: error.constraint
      }
    );
  }
  
  // Handle database timeout errors
  if (error instanceof DatabaseTimeoutError) {
    console.error('Database timeout error:', error);
    return errorResponse(
      'Database operation timed out',
      HttpStatus.GATEWAY_TIMEOUT,
      'DATABASE_TIMEOUT_ERROR'
    );
  }
  
  // Handle database query errors
  if (error instanceof DatabaseQueryError) {
    console.error('Database query error:', error);
    return errorResponse(
      'Database query error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_QUERY_ERROR'
    );
  }
  
  // Handle other errors
  console.error('Unhandled error:', error);
  return errorResponse(
    'An unexpected error occurred',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'INTERNAL_SERVER_ERROR'
  );
}

/**
 * Higher-order function to wrap Next.js API route handlers with database error handling
 * @param handler The API route handler
 * @returns A wrapped handler with database error handling
 */
export function withDatabaseHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Check database health
    const healthCheck = checkDatabaseHealth(req);
    if (healthCheck) {
      return healthCheck;
    }
    
    try {
      // Execute the handler with database connection
      return await withDatabase(async () => {
        return await handler(req);
      });
    } catch (error) {
      return handleDatabaseError(error);
    }
  };
}