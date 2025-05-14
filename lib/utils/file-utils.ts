/**
 * Utility functions for safe file handling
 */

/**
 * File information interface
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  path?: string;
  webkitRelativePath?: string;
}

/**
 * Safe file information with fallback values
 */
export interface SafeFileInfo {
  fileName: string;
  fileSize: number | string;
  fileType: string;
  lastModified?: Date | string;
  filePath?: string;
  relativePath?: string;
  extension?: string;
}

/**
 * Safely extracts file information with fallback values
 * @param file The file object which might be undefined
 * @returns An object with file properties or fallback values
 */
export function getSafeFileInfo(file: FileInfo | File | null | undefined): SafeFileInfo {
  if (!file) {
    return {
      fileName: 'unknown',
      fileSize: 'unknown',
      fileType: 'unknown',
      lastModified: 'unknown',
      extension: 'unknown'
    };
  }

  // Extract file extension from name
  const extension = file.name.includes('.') 
    ? file.name.split('.').pop()?.toLowerCase() 
    : 'unknown';

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'unknown',
    lastModified: file.lastModified ? new Date(file.lastModified) : 'unknown',
    filePath: 'path' in file ? file.path : undefined,
    relativePath: 'webkitRelativePath' in file ? file.webkitRelativePath : undefined,
    extension
  };
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
  file: FileInfo | File | null | undefined,
  error?: unknown
): Record<string, unknown> {
  return {
    message,
    ...getSafeFileInfo(file),
    error: error ? String(error) : undefined,
    timestamp: new Date().toISOString()
  };
}

/**
 * Safely checks if a file is of a specific type
 * @param file The file object which might be undefined
 * @param allowedTypes Array of allowed MIME types or extensions
 * @returns Boolean indicating if the file is of an allowed type
 */
export function isAllowedFileType(
  file: FileInfo | File | null | undefined, 
  allowedTypes: string[]
): boolean {
  if (!file) return false;
  
  const fileInfo = getSafeFileInfo(file);
  
  // Check MIME type
  if (fileInfo.fileType !== 'unknown') {
    if (allowedTypes.some(type => fileInfo.fileType.includes(type))) {
      return true;
    }
  }
  
  // Check extension
  if (fileInfo.extension !== 'unknown') {
    if (allowedTypes.some(type => 
      type.startsWith('.') 
        ? fileInfo.extension === type.substring(1) 
        : fileInfo.extension === type
    )) {
      return true;
    }
  }
  
  return false;
}

/**
 * Safely checks if a file is within size limits
 * @param file The file object which might be undefined
 * @param maxSizeBytes Maximum file size in bytes
 * @returns Boolean indicating if the file is within size limits
 */
export function isFileSizeValid(
  file: FileInfo | File | null | undefined, 
  maxSizeBytes: number
): boolean {
  if (!file) return false;
  
  return typeof file.size === 'number' && file.size <= maxSizeBytes;
}

/**
 * Formats file size in human-readable format
 * @param sizeInBytes File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(sizeInBytes: number | string): string {
  if (typeof sizeInBytes !== 'number') return 'unknown';
  
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}