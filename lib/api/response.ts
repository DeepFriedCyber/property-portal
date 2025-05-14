import { NextResponse } from 'next/server';

export type ApiResponse<T = any> = {
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
  SERVICE_UNAVAILABLE: 503
} as const;