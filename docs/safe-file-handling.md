# Safe File Handling

## The Problem with Unsafe File Access

When working with files in JavaScript/TypeScript, it's common to encounter situations where a file object might be undefined or null, especially in error contexts or when handling user inputs.

### ❌ Unsafe File Property Access

```typescript
// This will throw if file is undefined
logger.error({
  fileName: file.name,
  fileSize: file.size,
  error: error.message,
});
```

If `file` is undefined, this code will throw a runtime error, potentially causing your error logging to fail completely.

## Safe File Handling Approaches

### ✅ Using Optional Chaining and Nullish Coalescing

```typescript
// Safe access with optional chaining and fallbacks
logger.error({
  fileName: file?.name ?? 'unknown',
  fileSize: file?.size ?? 'unknown',
  error: error.message,
});
```

This approach safely handles the case where `file` is undefined or null.

### ✅ Using Utility Functions for Consistency

```typescript
import { createFileErrorLog } from '../lib/utils/file-utils';

// Using a utility function for consistent handling
logger.error(createFileErrorLog('Error processing file', file, error));
```

## Best Practices for File Handling

1. **Always use optional chaining (`?.`) when accessing file properties**

   ```typescript
   const fileName = file?.name ?? 'unknown';
   ```

2. **Provide fallback values with nullish coalescing (`??`)**

   ```typescript
   const fileSize = file?.size ?? 'unknown';
   ```

3. **Use utility functions for consistent handling**

   ```typescript
   const fileInfo = getSafeFileInfo(file);
   ```

4. **Validate file existence before operations**

   ```typescript
   if (!file) {
     throw new Error('No file provided');
   }
   ```

5. **Include file information in error logs**
   ```typescript
   logger.error(createFileErrorLog('Upload failed', file, error));
   ```

## File Validation Examples

### File Type Validation

```typescript
import { isAllowedFileType } from '../lib/utils/file-utils';

function validateFileType(file: File | undefined) {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (!isAllowedFileType(file, allowedTypes)) {
    throw new Error('Unsupported file type');
  }
}
```

### File Size Validation

```typescript
import { isFileSizeValid, formatFileSize } from '../lib/utils/file-utils';

function validateFileSize(file: File | undefined) {
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!isFileSizeValid(file, maxSize)) {
    const formattedSize = formatFileSize(file?.size ?? 0);
    const formattedMax = formatFileSize(maxSize);
    throw new Error(`File too large (${formattedSize}). Maximum size is ${formattedMax}`);
  }
}
```

## Complete File Upload Example

```typescript
import { getSafeFileInfo, isAllowedFileType, isFileSizeValid } from '../lib/utils/file-utils';

async function handleFileUpload(file: File | undefined) {
  try {
    // Validate file existence
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!isAllowedFileType(file, allowedTypes)) {
      throw new Error('Unsupported file type');
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!isFileSizeValid(file, maxSize)) {
      throw new Error('File too large');
    }

    // Process file upload
    const result = await uploadFile(file);
    return result;
  } catch (error) {
    // Safe error logging with file context
    logger.error({
      message: 'File upload failed',
      ...getSafeFileInfo(file),
      error: String(error),
    });

    // Re-throw or handle as needed
    throw error;
  }
}
```

By following these practices, you'll create more robust file handling code that gracefully handles undefined or null file objects.
