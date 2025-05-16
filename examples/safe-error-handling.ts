// Safe Error Handling Examples

/**
 * Safely converts any error to a string representation
 * Works with any type of error (Error objects, strings, numbers, etc.)
 */
export function normalizeError(error: unknown): string {
  // Simply use String() to safely convert any error type
  return String(error);
}

/**
 * Safely extracts error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Safely extracts error details from any error type
 */
export function getErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
  name?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      // Handle common error types with codes
      code: 'code' in error ? String((error as any).code) : undefined,
    };
  }

  return {
    message: String(error),
  };
}

// Example usage:

// ❌ BAD: Unsafe error handling
function unsafeErrorHandling(parseError: unknown) {
  try {
    // This assumes parseError is an Error object
    // Will fail if parseError is a string, number, or other type
    console.error('CSV Parse Error:', (parseError as Error).message);
    console.error('Stack:', (parseError as Error).stack);
  } catch (e) {
    // Have to add another try/catch to handle the case where parseError isn't an Error
    console.error('Failed to log error');
  }
}

// ✅ GOOD: Safe error handling with instanceof check
function betterErrorHandling(parseError: unknown) {
  if (parseError instanceof Error) {
    console.error('CSV Parse Error:', parseError.message);
    console.error('Stack:', parseError.stack);
  } else {
    console.error('CSV Parse Error:', String(parseError));
  }
}

// ✅ BEST: Simple and safe error handling with String()
function bestErrorHandling(parseError: unknown) {
  // No need for instanceof checks or type assertions
  console.error('CSV Parse Error:', String(parseError));
}

// Example with CSV parsing
async function processCSV(filePath: string) {
  try {
    // Simulated CSV parsing
    const result = await simulateCSVParsing(filePath);
    return result;
  } catch (parseError) {
    // ✅ GOOD: Safe error logging
    console.error('CSV Parse Error:', String(parseError));

    // You can still get structured error info if needed
    const errorDetails = getErrorDetails(parseError);
    console.error('Error details:', errorDetails);

    // Re-throw or handle as needed
    throw new Error(`Failed to parse CSV: ${String(parseError)}`);
  }
}

// Simulated function for example
async function simulateCSVParsing(filePath: string) {
  // Simulation only
  if (filePath.includes('invalid')) {
    throw new Error('Invalid CSV format');
  }
  if (!filePath.endsWith('.csv')) {
    // This throws a non-Error object
    throw 'Unsupported file format';
  }
  return [{ name: 'John', age: 30 }];
}

export { unsafeErrorHandling, betterErrorHandling, bestErrorHandling, processCSV };
