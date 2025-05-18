/**
 * Error handling utilities for upload processing
 */
import { normalizeError } from '../error/error-utils'

/**
 * Interface for upload data
 */
export interface UploadData {
  id: string
  fileName?: string
  fileSize?: number
  uploaderId?: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
  propertyCount?: number
  [key: string]: any // Allow for additional properties
}

/**
 * Interface for error context
 */
export interface ErrorContext {
  operation: string
  uploadId?: string
  fileName?: string
  additionalInfo?: Record<string, any>
}

/**
 * Safely logs upload processing errors with consistent formatting
 * @param error The error that occurred
 * @param context Context information about the operation
 * @param includeUploaderId Whether to include the uploader ID in logs (defaults to false for privacy)
 */
export function logUploadError(
  error: unknown,
  context: ErrorContext,
  includeUploaderId = false
): void {
  // Create a structured error object for logging
  const errorObj = {
    message: normalizeError(error),
    operation: context.operation,
    uploadId: context.uploadId || 'unknown',
    fileName: context.fileName || 'unknown',
    timestamp: new Date().toISOString(),
    ...context.additionalInfo,
  }

  // Remove sensitive information if not explicitly included
  if (!includeUploaderId && context.additionalInfo && 'uploaderId' in context.additionalInfo) {
    // Use type assertion or index notation to avoid TypeScript error
    delete (errorObj as Record<string, any>)['uploaderId']
  }

  // Log differently based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, include more details including the stack trace
    console.error(`[UPLOAD ERROR] ${context.operation}:`, errorObj, error)
  } else {
    // In production, log a structured object without the full error
    console.error(`[UPLOAD ERROR] ${context.operation}:`, JSON.stringify(errorObj))
  }
}

/**
 * Creates a safe fallback response when property count determination fails
 * @param upload The upload data object
 * @param error The error that occurred
 * @returns A sanitized upload object with fallback values
 */
export function createPropertyCountFallback(
  upload: UploadData | null | undefined,
  error: unknown
): UploadData {
  // Log the error with appropriate context
  logUploadError(error, {
    operation: 'getPropertyCount',
    uploadId: upload?.id,
    fileName: upload?.fileName,
    additionalInfo: {
      fileSize: upload?.fileSize,
      status: upload?.status,
    },
  })

  // Return a sanitized object with fallback values
  return {
    ...upload,
    id: upload?.id || 'unknown',
    propertyCount: 0,
    countError: true, // Flag to indicate the count is unreliable
    uploaderId: undefined, // Remove uploader ID for privacy
    errorMessage:
      process.env.NODE_ENV === 'development'
        ? normalizeError(error)
        : 'Failed to determine property count',
  }
}

/**
 * Creates a safe response for upload processing errors
 * @param upload The upload data object
 * @param error The error that occurred
 * @param operation The operation that failed
 * @returns A sanitized upload object with error information
 */
export function createUploadErrorResponse(
  upload: UploadData | null | undefined,
  error: unknown,
  operation: string
): UploadData & { error: boolean } {
  // Log the error with appropriate context
  logUploadError(error, {
    operation,
    uploadId: upload?.id,
    fileName: upload?.fileName,
  })

  // Return a sanitized object with error information
  return {
    ...upload,
    id: upload?.id || 'unknown',
    error: true,
    status: 'error',
    errorMessage:
      process.env.NODE_ENV === 'development'
        ? normalizeError(error)
        : `Failed to process upload: ${operation}`,
    uploaderId: undefined, // Remove uploader ID for privacy
  }
}

/**
 * Safely extracts upload information with privacy considerations
 * @param upload The upload data object
 * @param includePrivateData Whether to include private data
 * @returns A sanitized upload object
 */
export function sanitizeUploadData(
  upload: UploadData | null | undefined,
  includePrivateData = false
): Partial<UploadData> {
  if (!upload) {
    return { id: 'unknown' }
  }

  // Create a base object with non-sensitive data
  const sanitized: Partial<UploadData> = {
    id: upload.id,
    fileName: upload.fileName,
    fileSize: upload.fileSize,
    status: upload.status,
    createdAt: upload.createdAt,
    updatedAt: upload.updatedAt,
    propertyCount: upload.propertyCount,
  }

  // Include private data if explicitly requested
  if (includePrivateData) {
    sanitized.uploaderId = upload.uploaderId
    // Add other private fields as needed
  }

  return sanitized
}
