/**
 * Example of improved upload error handling
 */
import {
  createPropertyCountFallback,
  createUploadErrorResponse,
  sanitizeUploadData,
  logUploadError,
  UploadData,
} from '../lib/uploads/error-handling'

/**
 * Example function to get property count for an upload
 */
async function getPropertyCountForUpload(uploadId: string): Promise<number> {
  try {
    // Simulated database query to get property count
    const count = await simulatePropertyCountQuery(uploadId)
    return count
  } catch (error) {
    // ❌ BAD: Inconsistent error handling with potential privacy issues
    /*
    console.error("Failed to get property count for upload:", uploadId, error);
    return 0;
    */

    // ❌ BAD: Environment-specific logging with string concatenation
    /*
    if (process.env.NODE_ENV === "development") {
      console.error("Property count error (uploadId: " + uploadId + "):", error);
    }
    */

    // ✅ GOOD: Use the utility function for consistent error handling
    logUploadError(error, {
      operation: 'getPropertyCount',
      uploadId,
      additionalInfo: { attemptedOperation: 'database query' },
    })

    // Re-throw to be handled by the caller
    throw error
  }
}

/**
 * Example function to get upload details with property count
 */
async function getUploadWithPropertyCount(uploadId: string): Promise<UploadData> {
  try {
    // Get basic upload information
    const upload = await simulateGetUpload(uploadId)

    // Get property count
    try {
      const propertyCount = await getPropertyCountForUpload(uploadId)
      return {
        ...upload,
        propertyCount,
      }
    } catch (error) {
      // ❌ BAD: Inconsistent error handling
      /*
      console.error("Failed to get property count for upload:", upload?.id, error);
      return {
        ...upload,
        propertyCount: 0,
        countError: true,
        uploaderId: undefined,
      };
      */

      // ✅ GOOD: Use the utility function for consistent fallback
      return createPropertyCountFallback(upload, error)
    }
  } catch (error) {
    // ❌ BAD: Inconsistent error handling
    /*
    console.error("Failed to get upload:", uploadId, error);
    return {
      id: uploadId,
      error: true,
      status: 'error'
    };
    */

    // ✅ GOOD: Use the utility function for consistent error response
    return createUploadErrorResponse({ id: uploadId }, error, 'getUploadWithPropertyCount')
  }
}

/**
 * Example API handler for getting upload details
 */
async function handleGetUploadRequest(req: any, res: any) {
  const uploadId = req.params.id
  const isAdmin = req.user?.role === 'admin'

  try {
    const upload = await getUploadWithPropertyCount(uploadId)

    // ❌ BAD: Inconsistent handling of private data
    /*
    if (!isAdmin) {
      delete upload.uploaderId;
    }
    res.json(upload);
    */

    // ✅ GOOD: Use the utility function for consistent data sanitization
    const sanitizedUpload = sanitizeUploadData(upload, isAdmin)
    res.json(sanitizedUpload)
  } catch (error) {
    // ❌ BAD: Inconsistent error response
    /*
    console.error("API error:", error);
    res.status(500).json({ error: "Failed to get upload" });
    */

    // ✅ GOOD: Use the utility function for consistent error response
    logUploadError(error, {
      operation: 'handleGetUploadRequest',
      uploadId,
      additionalInfo: { userRole: req.user?.role },
    })

    res.status(500).json({
      error: true,
      message:
        process.env.NODE_ENV === 'development'
          ? String(error)
          : 'Failed to retrieve upload information',
    })
  }
}

// Simulated functions for demonstration
async function simulatePropertyCountQuery(uploadId: string): Promise<number> {
  // Simulate different scenarios based on uploadId
  if (uploadId === 'valid-id') {
    return 42
  } else if (uploadId === 'empty-id') {
    return 0
  } else if (uploadId === 'error-id') {
    throw new Error('Database query failed')
  } else {
    throw new Error('Upload not found')
  }
}

async function simulateGetUpload(uploadId: string): Promise<UploadData> {
  // Simulate different scenarios based on uploadId
  if (uploadId === 'valid-id' || uploadId === 'empty-id') {
    return {
      id: uploadId,
      fileName: 'properties.csv',
      fileSize: 1024,
      uploaderId: 'user-123',
      status: 'processed',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } else if (uploadId === 'error-id') {
    throw new Error('Database query failed')
  } else {
    throw new Error('Upload not found')
  }
}

export { getPropertyCountForUpload, getUploadWithPropertyCount, handleGetUploadRequest }
