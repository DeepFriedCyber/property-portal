// db/error-handler.ts
import { PostgresError } from 'postgres';

// Custom database error types
export class DatabaseConnectionError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseQueryError extends Error {
  constructor(message: string, public query?: string, public params?: unknown[], public cause?: unknown) {
    super(message);
    this.name = 'DatabaseQueryError';
  }
}

export class DatabaseConstraintError extends Error {
  constructor(message: string, public constraint?: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseConstraintError';
  }
}

export class DatabaseTimeoutError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DatabaseTimeoutError';
  }
}

/**
 * Handle database errors in a standardized way
 * @param error The error to handle
 * @param context Additional context for the error
 * @returns A standardized error object
 */
export function handleDatabaseError(error: unknown, context?: { query?: string; params?: unknown[] }): Error {
  // If it's already one of our custom errors, just return it
  if (
    error instanceof DatabaseConnectionError ||
    error instanceof DatabaseQueryError ||
    error instanceof DatabaseConstraintError ||
    error instanceof DatabaseTimeoutError
  ) {
    return error;
  }

  // Handle postgres-js specific errors
  if (typeof error === 'object' && error !== null) {
    // Check if it's a PostgresError
    if ('code' in error && typeof error.code === 'string') {
      const pgError = error as PostgresError;
      
      // Connection errors
      if (pgError.code.startsWith('08')) {
        return new DatabaseConnectionError(
          `Database connection error: ${pgError.message || 'Unknown connection error'}`,
          error
        );
      }
      
      // Constraint violations
      if (pgError.code.startsWith('23')) {
        const constraint = 'constraint' in pgError ? String(pgError.constraint) : undefined;
        return new DatabaseConstraintError(
          `Database constraint violation: ${pgError.message || 'Unknown constraint error'}`,
          constraint,
          error
        );
      }
      
      // Query timeout
      if (pgError.code === '57014') {
        return new DatabaseTimeoutError(
          `Database query timeout: ${pgError.message || 'Query canceled due to timeout'}`,
          error
        );
      }
    }

    // Handle timeout errors from the postgres client
    if ('message' in error && typeof error.message === 'string' && error.message.includes('timeout')) {
      return new DatabaseTimeoutError(
        `Database operation timed out: ${error.message}`,
        error
      );
    }
  }

  // For all other errors, wrap in a generic DatabaseQueryError
  const errorMessage = error instanceof Error ? error.message : String(error);
  return new DatabaseQueryError(
    `Database query error: ${errorMessage}`,
    context?.query,
    context?.params,
    error
  );
}

/**
 * Wrap a database operation with standardized error handling
 * @param operation The database operation to execute
 * @param context Additional context for error reporting
 * @returns The result of the operation
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: { query?: string; params?: unknown[] }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw handleDatabaseError(error, context);
  }
}