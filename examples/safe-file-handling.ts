/**
 * Safe File Handling Examples
 *
 * This file demonstrates best practices for safely accessing file properties
 * in error contexts and other situations where files might be undefined.
 */

// Type definition for file objects
interface FileInfo {
  name: string
  size: number
  type: string
  lastModified?: number
}

/**
 * Safely extracts file information with fallback values
 * @param file The file object which might be undefined
 * @returns An object with file properties or fallback values
 */
export function getSafeFileInfo(file: FileInfo | null | undefined): {
  fileName: string
  fileSize: number | string
  fileType: string
  lastModified?: Date | string
} {
  return {
    fileName: file?.name ?? 'unknown',
    fileSize: file?.size ?? 'unknown',
    fileType: file?.type ?? 'unknown',
    lastModified: file?.lastModified ? new Date(file.lastModified) : 'unknown',
  }
}

/**
 * Creates a structured log object with safe file information
 * @param message The log message
 * @param file The file object which might be undefined
 * @param error Optional error object
 * @returns A structured log object
 */
export function createFileErrorLog(
  message: string,
  file: FileInfo | null | undefined,
  error?: unknown
): Record<string, unknown> {
  return {
    message,
    ...getSafeFileInfo(file),
    error: error ? String(error) : undefined,
    timestamp: new Date().toISOString(),
  }
}

// Example usage:

// ❌ BAD: Unsafe file property access
function unsafeFileLogging(file: FileInfo | undefined, error: Error) {
  // This will throw if file is undefined
  console.error(`Error processing file ${file.name} of size ${file.size}:`, error.message)

  // This structured log will fail if file is undefined
  const logData = {
    fileName: file.name,
    fileSize: file.size,
    error: error.message,
  }
  console.error(logData)
}

// ✅ GOOD: Safe file property access with optional chaining and nullish coalescing
function betterFileLogging(file: FileInfo | undefined, error: Error) {
  // Safe access with optional chaining and fallbacks
  console.error(
    `Error processing file ${file?.name ?? 'unknown'} of size ${file?.size ?? 'unknown'}:`,
    error.message
  )

  // Safe structured logging
  const logData = {
    fileName: file?.name ?? 'unknown',
    fileSize: file?.size ?? 'unknown',
    error: error.message,
  }
  console.error(logData)
}

// ✅ BEST: Using utility functions for consistent handling
function bestFileLogging(file: FileInfo | undefined, error: unknown) {
  // Using the utility function for consistent handling
  const logData = createFileErrorLog('Error processing file', file, error)
  console.error(logData)

  // Could also use a logger library
  // logger.error(createFileErrorLog('Error processing file', file, error));
}

// Example: File upload error handling
async function handleFileUpload(file: FileInfo | undefined) {
  try {
    if (!file) {
      throw new Error('No file provided')
    }

    // Simulate file upload
    await simulateFileUpload(file)

    return { success: true }
  } catch (error) {
    // ✅ GOOD: Safe error logging with file context
    const logData = createFileErrorLog('File upload failed', file, error)
    console.error(logData)

    // Return structured error response
    return {
      success: false,
      error: String(error),
      fileName: file?.name ?? 'unknown',
    }
  }
}

// Simulated function for example
async function simulateFileUpload(file: FileInfo): Promise<void> {
  // Simulation only
  if (file.size > 10000000) {
    throw new Error('File too large')
  }
  if (!file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
    throw new Error('Unsupported file type')
  }
  // Simulate network error
  if (Math.random() < 0.1) {
    throw new Error('Network error')
  }
  // Success case
  return Promise.resolve()
}

export { unsafeFileLogging, betterFileLogging, bestFileLogging, handleFileUpload }
