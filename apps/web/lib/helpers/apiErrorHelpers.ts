import { NextResponse } from 'next/server';

import { HttpStatus } from '../../lib/db/nextjs-utils';
import { ErrorCode, ErrorMessage } from '../constants/errorCodes';

/**
 * Type for API error response
 */
type ApiErrorResponse = {
  success: boolean;
  error: {
    message: string;
    code: string;
    details?: any;
  };
};

/**
 * Create a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @param code Error code
 * @param details Optional error details
 * @returns NextResponse with standardized error format
 */
export function createErrorResponse(
  message: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  code: string = ErrorCode.INTERNAL_SERVER_ERROR,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Common error responses for API handlers
 */
export const ApiErrors = {
  /**
   * Property not found error with more descriptive message
   */
  propertyNotFound: (id?: string) =>
    createErrorResponse(
      id
        ? `No property exists with the ID: ${id}. Please verify the ID and try again.`
        : `Property not found. The requested property does not exist or has been removed.`,
      HttpStatus.NOT_FOUND,
      ErrorCode.PROPERTY_NOT_FOUND
    ),

  /**
   * Missing parameter error with more descriptive messages
   */
  missingParameter: (paramName: string) => {
    // Create more descriptive error messages based on the parameter name
    let customMessage: string;

    if (paramName === 'id') {
      customMessage = "The 'id' parameter is required to identify the specific resource";
    } else if (paramName === 'uploadId') {
      customMessage = "The 'uploadId' parameter is required to filter properties by upload";
    } else if (paramName === 'id or uploadId') {
      customMessage =
        "Either 'id' (for a single property) or 'uploadId' (for multiple properties) is required";
    } else {
      customMessage = `${ErrorMessage[ErrorCode.MISSING_PARAMETER]}: ${paramName}`;
    }

    return createErrorResponse(customMessage, HttpStatus.BAD_REQUEST, ErrorCode.MISSING_PARAMETER);
  },

  /**
   * Invalid parameter error with more descriptive messages
   */
  invalidParameter: (paramName: string, reason?: string) => {
    let message: string;

    if (paramName === 'query parameters' && reason?.includes('id OR uploadId')) {
      message =
        "API request conflict: You cannot specify both 'id' and 'uploadId' parameters simultaneously. Please use only one of these parameters per request.";
    } else if (paramName.includes('price')) {
      message = `Invalid price parameter: ${reason || 'Price must be a positive number'}`;
    } else if (paramName.includes('status')) {
      message = `Invalid status value: ${reason || 'Status must be one of: available, pending, sold'}`;
    } else {
      message = `${ErrorMessage[ErrorCode.INVALID_PARAMETER]}: ${paramName}${reason ? ` - ${reason}` : ''}`;
    }

    return createErrorResponse(message, HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER);
  },

  /**
   * Invalid ID format error with more descriptive message and examples
   */
  invalidIdFormat: (id: string, expectedFormat: string = 'UUID') => {
    let message = `${ErrorMessage[ErrorCode.INVALID_ID_FORMAT]}: "${id}" is not a valid ${expectedFormat}`;

    // Add helpful examples based on the expected format
    if (expectedFormat.toLowerCase() === 'uuid') {
      message += `. UUID must be in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (e.g., 123e4567-e89b-12d3-a456-426614174000)`;
    } else if (expectedFormat.toLowerCase() === 'integer') {
      message += `. Expected a numeric value (e.g., 1234)`;
    }

    return createErrorResponse(message, HttpStatus.BAD_REQUEST, ErrorCode.INVALID_ID_FORMAT);
  },

  /**
   * Validation error
   */
  validationError: (details: any) =>
    createErrorResponse(
      ErrorMessage[ErrorCode.VALIDATION_ERROR],
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      details
    ),

  /**
   * Database error
   */
  databaseError: (message?: string, details?: any) =>
    createErrorResponse(
      message || ErrorMessage[ErrorCode.DATABASE_ERROR],
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DATABASE_ERROR,
      details
    ),

  /**
   * Unauthorized error (authentication required)
   */
  unauthorized: (message?: string) =>
    createErrorResponse(
      message || ErrorMessage[ErrorCode.UNAUTHORIZED],
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED
    ),

  /**
   * Forbidden error (insufficient permissions)
   */
  forbidden: (message?: string) =>
    createErrorResponse(
      message || ErrorMessage[ErrorCode.FORBIDDEN],
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN
    ),
};
