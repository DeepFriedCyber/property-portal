import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse } from './response';

/**
 * Validate request query parameters against a Zod schema
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @returns The validated query parameters or null if validation fails
 */
export async function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T> | null> {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    return schema.parse(searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error('Invalid query parameters');
  }
}

/**
 * Validate request body against a Zod schema
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @returns The validated body or null if validation fails
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T> | null> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new Error('Invalid request body');
  }
}

/**
 * Handle validation errors in API routes
 * @param handler The API route handler function
 * @returns A wrapped handler that handles validation errors
 */
export function withValidation(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(
          'Validation error',
          422,
          'VALIDATION_ERROR',
          error.errors
        );
      }
      
      console.error('API error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      );
    }
  };
}