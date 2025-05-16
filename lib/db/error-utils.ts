/**
 * Database error handling utilities
 */

import { normalizeError } from '../error/error-utils';

/**
 * Error codes that might be present in database connection errors
 */
export enum DbErrorCode {
  CONNECTION_REFUSED = 'ECONNREFUSED',
  CONNECTION_RESET = 'ECONNRESET',
  CONNECTION_TIMEOUT = 'ETIMEDOUT',
  HOST_NOT_FOUND = 'ENOTFOUND',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_NOT_FOUND = 'DATABASE_NOT_FOUND',
}

/**
 * Interface for database error details
 */
export interface DbErrorDetails {
  message: string;
  code?: string;
  errno?: number;
  sqlState?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  query?: string;
  stack?: string;
}

/**
 * Creates a detailed database connection error message
 * @param err The original error object
 * @returns A detailed error message string
 */
export function createDetailedDbConnectionErrorMessage(err: unknown): string {
  // Handle case where err is not an object
  if (!err || typeof err !== 'object') {
    return `Database connection error: ${normalizeError(err)}`;
  }

  const errorObj = err as Record<string, any>;
  const details: DbErrorDetails = {
    message: errorObj.message || 'Unknown error',
    code: errorObj.code,
    errno: errorObj.errno,
    sqlState: errorObj.sqlState,
    host: errorObj.host || errorObj.address,
    port: errorObj.port,
    database: errorObj.database,
    user: errorObj.user,
  };

  // Build a detailed error message
  let errorMessage = `Database connection error: ${details.message}`;

  // Add error code if available
  if (details.code) {
    errorMessage += ` (Code: ${details.code})`;
  }

  // Add connection details if available
  const connectionDetails = [];
  if (details.host) connectionDetails.push(`Host: ${details.host}`);
  if (details.port) connectionDetails.push(`Port: ${details.port}`);
  if (details.database) connectionDetails.push(`Database: ${details.database}`);
  if (details.user) connectionDetails.push(`User: ${details.user}`);

  if (connectionDetails.length > 0) {
    errorMessage += ` | Connection details: ${connectionDetails.join(', ')}`;
  }

  // Add SQL state if available (useful for SQL standard errors)
  if (details.sqlState) {
    errorMessage += ` | SQL State: ${details.sqlState}`;
  }

  return errorMessage;
}

/**
 * Creates a structured error object for database connection errors
 * @param err The original error object
 * @returns A structured error object with detailed information
 */
export function createDbConnectionErrorObject(
  err: unknown
): DbErrorDetails & { originalError: unknown } {
  // Handle case where err is not an object
  if (!err || typeof err !== 'object') {
    return {
      message: `Database connection error: ${normalizeError(err)}`,
      originalError: err,
    };
  }

  const errorObj = err as Record<string, any>;
  const details: DbErrorDetails = {
    message: errorObj.message || 'Unknown error',
    code: errorObj.code,
    errno: errorObj.errno,
    sqlState: errorObj.sqlState,
    host: errorObj.host || errorObj.address,
    port: errorObj.port,
    database: errorObj.database,
    user: errorObj.user,
    stack: errorObj.stack,
  };

  // Add the original error for reference
  return {
    ...details,
    originalError: err,
  };
}

/**
 * Determines if an error is a specific type of database error
 * @param err The error to check
 * @param errorCode The error code to check for
 * @returns True if the error matches the specified code
 */
export function isDbErrorOfType(err: unknown, errorCode: DbErrorCode): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }

  const errorObj = err as Record<string, any>;
  return errorObj.code === errorCode;
}

/**
 * Provides a user-friendly message for common database errors
 * @param err The database error
 * @returns A user-friendly error message
 */
export function getUserFriendlyDbErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return 'Unable to connect to the database. Please try again later.';
  }

  const errorObj = err as Record<string, any>;
  const code = errorObj.code;

  switch (code) {
    case DbErrorCode.CONNECTION_REFUSED:
      return 'Database server is not accepting connections. Please check if the database server is running.';
    case DbErrorCode.CONNECTION_RESET:
      return 'Database connection was reset. This might be due to network issues or server restart.';
    case DbErrorCode.CONNECTION_TIMEOUT:
      return 'Database connection timed out. Please check network connectivity and server load.';
    case DbErrorCode.HOST_NOT_FOUND:
      return 'Database host not found. Please check the hostname and DNS configuration.';
    case DbErrorCode.AUTHENTICATION_FAILED:
      return 'Failed to authenticate with the database. Please check credentials.';
    case DbErrorCode.PERMISSION_DENIED:
      return 'Permission denied when connecting to database. Please check user permissions.';
    case DbErrorCode.DATABASE_NOT_FOUND:
      return 'The specified database was not found on the server.';
    default:
      return `Database error: ${errorObj.message || 'Unknown error'}`;
  }
}
