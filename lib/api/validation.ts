import { NextRequest } from 'next/server';
import { z } from 'zod';

import { errorResponse, HttpStatus } from './response';

/**
 * Custom error class for JSON parsing errors
 */
export class JsonParseError extends Error {
  constructor(
    message: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'JsonParseError';
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Format Zod validation errors into a more user-friendly format
 * @param error Zod error object
 * @returns Formatted error object with field paths and messages
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    const fieldName = path || 'value';

    // Create more specific error messages based on error code
    let message = err.message;

    switch (err.code) {
      case 'invalid_type':
        if (err.expected === 'string' && err.received === 'undefined') {
          message = 'This field is required';
        } else {
          message = `Expected ${err.expected}, received ${err.received}`;
        }
        break;
      case 'too_small':
        if (err.type === 'string') {
          if (err.minimum === 1) {
            message = 'This field cannot be empty';
          } else {
            message = `Must be at least ${err.minimum} characters`;
          }
        } else if (err.type === 'number') {
          message = `Must be greater than or equal to ${err.minimum}`;
        } else if (err.type === 'array') {
          message = `Must have at least ${err.minimum} item(s)`;
        }
        break;
      case 'too_big':
        if (err.type === 'string') {
          message = `Must be at most ${err.maximum} characters`;
        } else if (err.type === 'number') {
          message = `Must be less than or equal to ${err.maximum}`;
        } else if (err.type === 'array') {
          message = `Must have at most ${err.maximum} item(s)`;
        }
        break;
      case 'invalid_string':
        if (err.validation === 'email') {
          message = 'Must be a valid email address';
        } else if (err.validation === 'url') {
          message = 'Must be a valid URL';
        } else if (err.validation === 'uuid') {
          message = 'Must be a valid UUID';
        }
        break;
      case 'invalid_enum_value':
        message = `Must be one of: ${err.options.map((o) => `'${o}'`).join(', ')}`;
        break;
      case 'invalid_date':
        message = 'Must be a valid date';
        break;
    }

    formattedErrors[fieldName] = message;
  });

  return formattedErrors;
}

/**
 * Validate request query parameters against a Zod schema
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @returns The validated query parameters
 * @throws ValidationError if validation fails
 */
export async function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    return schema.parse(searchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodError(error);
      throw new ValidationError(
        'Invalid query parameters',
        'INVALID_QUERY_PARAMETERS',
        formattedErrors
      );
    }
    throw new ValidationError('Failed to process query parameters', 'QUERY_PROCESSING_ERROR');
  }
}

/**
 * Validate request body against a Zod schema
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @returns The validated body
 * @throws JsonParseError if JSON parsing fails
 * @throws ValidationError if validation fails
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let body: any;

  try {
    body = await request.json();
  } catch (error) {
    // Handle JSON parsing errors specifically
    const originalError = error instanceof Error ? error : new Error('Unknown error');

    // Check for common JSON parsing error patterns
    const errorMessage = originalError.message || '';

    if (errorMessage.includes('Unexpected end of JSON input')) {
      throw new JsonParseError(
        'Incomplete JSON data received. Please check that your request body is complete.',
        originalError
      );
    } else if (errorMessage.includes('Unexpected token')) {
      throw new JsonParseError(
        'Malformed JSON data received. Please check your request syntax.',
        originalError
      );
    } else {
      throw new JsonParseError(
        'Failed to parse request body as JSON. Please ensure your request contains valid JSON data.',
        originalError
      );
    }
  }

  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodError(error);
      throw new ValidationError('Invalid request data', 'VALIDATION_ERROR', formattedErrors);
    }
    throw new ValidationError('Failed to validate request data', 'VALIDATION_PROCESSING_ERROR');
  }
}

/**
 * Safely validate form data against a Zod schema
 * @param request The Next.js request object
 * @param schema The Zod schema to validate against
 * @returns The validated form data
 * @throws ValidationError if validation fails
 */
export async function validateFormData<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Convert numeric strings to numbers if they look like numbers
    const processedData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) {
          acc[key] = Number(value);
        } else {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return schema.parse(processedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodError(error);
      throw new ValidationError('Invalid form data', 'FORM_VALIDATION_ERROR', formattedErrors);
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ValidationError(
      `Failed to process form data: ${errorMessage}`,
      'FORM_PROCESSING_ERROR'
    );
  }
}

/**
 * Handle validation errors in API routes
 * @param handler The API route handler function
 * @returns A wrapped handler that handles validation errors
 */
export function withValidation(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const formattedErrors = formatZodError(error);
        return errorResponse(
          'Validation error',
          HttpStatus.UNPROCESSABLE_ENTITY,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }

      // Handle custom validation errors
      if (error instanceof ValidationError) {
        return errorResponse(
          error.message,
          HttpStatus.UNPROCESSABLE_ENTITY,
          error.code,
          error.details
        );
      }

      // Handle JSON parsing errors
      if (error instanceof JsonParseError) {
        return errorResponse(error.message, HttpStatus.BAD_REQUEST, 'INVALID_JSON', {
          originalError: error.originalError.message,
        });
      }

      // Handle other errors
      console.error('API error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'SERVER_ERROR'
      );
    }
  };
}
