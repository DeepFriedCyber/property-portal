/**
 * Centralized error codes for API responses
 */
export const ErrorCode = {
  // Resource errors
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  UPLOAD_NOT_FOUND: 'UPLOAD_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // Request errors
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  INVALID_ID_FORMAT: 'INVALID_ID_FORMAT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Authentication/Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONSTRAINT_ERROR: 'DATABASE_CONSTRAINT_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_TIMEOUT_ERROR: 'DATABASE_TIMEOUT_ERROR',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

/**
 * Default error messages for error codes
 */
export const ErrorMessage = {
  [ErrorCode.PROPERTY_NOT_FOUND]: 'Property not found',
  [ErrorCode.UPLOAD_NOT_FOUND]: 'Upload not found',
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  
  [ErrorCode.MISSING_PARAMETER]: 'Missing required parameter',
  [ErrorCode.INVALID_PARAMETER]: 'Invalid parameter value',
  [ErrorCode.INVALID_ID_FORMAT]: 'Invalid ID format',
  [ErrorCode.VALIDATION_ERROR]: 'Validation error',
  
  [ErrorCode.UNAUTHORIZED]: 'Authentication required',
  [ErrorCode.FORBIDDEN]: 'Access denied',
  
  [ErrorCode.DATABASE_ERROR]: 'Database error occurred',
  [ErrorCode.DATABASE_CONSTRAINT_ERROR]: 'Database constraint violation',
  [ErrorCode.DATABASE_CONNECTION_ERROR]: 'Database connection error',
  [ErrorCode.DATABASE_TIMEOUT_ERROR]: 'Database operation timed out',
  
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded, please try again later'
} as const;