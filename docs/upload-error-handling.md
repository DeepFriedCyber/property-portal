# Upload Error Handling Best Practices

## The Problem with Inconsistent Error Handling

When handling errors in upload processing, inconsistent approaches can lead to:

1. Privacy leaks (exposing sensitive information like uploader IDs)
2. Inconsistent error messages across different parts of the application
3. Insufficient context for debugging issues
4. Environment-specific code scattered throughout the codebase

### ❌ Problematic Error Handling

```typescript
// Inconsistent error logging
console.error("Failed to get property count for upload:", upload?.id, error);

// Environment-specific logging with string concatenation
if (process.env.NODE_ENV === "development") {
  console.error("Property count error (uploadId: " + upload?.id + "):", error);
}

// Inconsistent fallback response
return {
  ...upload,
  propertyCount: 0,
  countError: true,
  uploaderId: undefined, // Privacy concern handled inconsistently
};
```

## Standardized Error Handling Approach

### ✅ Consistent Error Logging

```typescript
import { logUploadError } from '../lib/uploads/error-handling';

// Structured error logging with consistent format
logUploadError(error, {
  operation: 'getPropertyCount',
  uploadId: upload?.id,
  fileName: upload?.fileName,
  additionalInfo: {
    fileSize: upload?.fileSize,
    status: upload?.status,
  }
});
```

### ✅ Consistent Fallback Responses

```typescript
import { createPropertyCountFallback } from '../lib/uploads/error-handling';

// When property count determination fails
try {
  const propertyCount = await getPropertyCountForUpload(uploadId);
  return { ...upload, propertyCount };
} catch (error) {
  // Consistent fallback with privacy protection
  return createPropertyCountFallback(upload, error);
}
```

## Key Principles for Upload Error Handling

1. **Consistent Error Logging**
   - Use structured logging with relevant context
   - Avoid exposing sensitive information in logs
   - Include operation name, upload ID, and timestamp

2. **Privacy Protection**
   - Remove sensitive information like uploader IDs from responses
   - Sanitize data before returning it to clients
   - Use different error messages for development and production

3. **Fallback Strategies**
   - Provide meaningful fallback values when operations fail
   - Indicate to the client when values are fallbacks (e.g., `countError: true`)
   - Maintain the integrity of the response structure

4. **Consistent Error Responses**
   - Use standardized error response formats
   - Include appropriate HTTP status codes
   - Provide user-friendly error messages in production

## Example: Complete Upload Processing Flow

```typescript
async function processUpload(uploadId: string, req: any, res: any) {
  try {
    // Get upload details
    const upload = await getUpload(uploadId);
    
    // Process the upload
    try {
      const result = await processUploadData(upload);
      
      // Return sanitized response
      const sanitizedResult = sanitizeUploadData(result, req.user.isAdmin);
      res.json(sanitizedResult);
    } catch (processingError) {
      // Handle processing errors with consistent fallback
      const fallbackResponse = createUploadErrorResponse(
        upload, 
        processingError, 
        'processUploadData'
      );
      
      // Return sanitized fallback
      const sanitizedFallback = sanitizeUploadData(fallbackResponse, req.user.isAdmin);
      res.status(500).json(sanitizedFallback);
    }
  } catch (error) {
    // Handle upload retrieval errors
    logUploadError(error, {
      operation: 'getUpload',
      uploadId,
      additionalInfo: { userRole: req.user?.role }
    });
    
    res.status(404).json({
      error: true,
      message: 'Upload not found or could not be processed'
    });
  }
}
```

## Utility Functions for Upload Error Handling

Our library provides several utility functions to standardize error handling:

1. **`logUploadError(error, context, includeUploaderId)`**
   - Logs errors with consistent formatting and context
   - Handles environment-specific logging automatically
   - Protects sensitive information by default

2. **`createPropertyCountFallback(upload, error)`**
   - Creates a safe fallback when property count determination fails
   - Logs the error with appropriate context
   - Removes sensitive information from the response

3. **`createUploadErrorResponse(upload, error, operation)`**
   - Creates a standardized error response for upload processing errors
   - Includes appropriate error flags and messages
   - Sanitizes sensitive information

4. **`sanitizeUploadData(upload, includePrivateData)`**
   - Removes sensitive information from upload data
   - Provides control over what data is exposed
   - Creates consistent response structures

By using these utilities consistently throughout your application, you'll create more robust error handling that protects privacy while providing valuable debugging information.