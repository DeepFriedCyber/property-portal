// lib/api/error-handling.ts
import { ApiResponse } from './response';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  
  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
  
  /**
   * Check if the error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 422 || this.code === 'VALIDATION_ERROR';
  }
  
  /**
   * Get validation errors as a record of field names to error messages
   */
  getValidationErrors(): Record<string, string> {
    if (!this.isValidationError() || !this.details) {
      return {};
    }
    
    // Handle different validation error formats
    if (Array.isArray(this.details)) {
      // Zod error format from the server
      return this.details.reduce((acc, error) => {
        if (error.path) {
          const path = Array.isArray(error.path) ? error.path.join('.') : error.path;
          acc[path] = error.message;
        }
        return acc;
      }, {} as Record<string, string>);
    } else if (typeof this.details === 'object') {
      // Already formatted errors
      return this.details as Record<string, string>;
    }
    
    return {};
  }
  
  /**
   * Create an ApiError from a Response object
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    try {
      const data = await response.json() as ApiResponse;
      
      if (data.error) {
        return new ApiError(
          data.error.message,
          response.status,
          data.error.code,
          data.error.details
        );
      }
      
      return new ApiError(
        'An unexpected error occurred',
        response.status
      );
    } catch (error) {
      return new ApiError(
        'Failed to parse error response',
        response.status
      );
    }
  }
}

/**
 * Handle fetch errors and convert them to ApiError
 * @param response Fetch response object
 * @throws ApiError if the response is not ok
 */
export async function handleFetchError(response: Response): Promise<void> {
  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }
}

/**
 * Parse API response data
 * @param response Fetch response object
 * @returns Parsed response data
 * @throws ApiError if the response is not ok
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  await handleFetchError(response);
  
  try {
    const data = await response.json() as ApiResponse<T>;
    return data.data as T;
  } catch (error) {
    throw new ApiError(
      'Failed to parse response data',
      500
    );
  }
}

/**
 * Create a fetch wrapper with error handling
 * @param baseUrl Base URL for API requests
 * @returns Fetch function with error handling
 */
export function createApiClient(baseUrl: string = '') {
  return async function fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const fullUrl = `${baseUrl}${url}`;
      const response = await fetch(fullUrl, options);
      return await parseApiResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  };
}