# Error Handling Best Practices

## Safe Error Normalization

When handling errors in JavaScript/TypeScript, it's important to remember that not all errors are instances of the `Error` class. Errors can come in various forms:

- Error objects (`new Error()`)
- String messages (`throw "Something went wrong"`)
- Numbers (`throw 404`)
- Other objects (`throw { code: 'INVALID_INPUT' }`)

### ❌ Unsafe Error Handling

```typescript
// UNSAFE: Assumes parseError is an Error object
try {
  // Some code that might throw
  parseCSV(data);
} catch (parseError) {
  // This will fail if parseError is not an Error object
  console.error('CSV Parse Error:', parseError.message);
  console.error('Stack:', parseError.stack);
}
```

### ✅ Safe Error Handling

The safest way to handle errors is to use `String()` to normalize any error type:

```typescript
try {
  // Some code that might throw
  parseCSV(data);
} catch (parseError) {
  // Works with any error type
  console.error('CSV Parse Error:', String(parseError));
}
```

## Type Checking vs. Normalization

### Type Checking Approach

```typescript
try {
  // Some code that might throw
  parseCSV(data);
} catch (parseError) {
  if (parseError instanceof Error) {
    console.error('Error message:', parseError.message);
    console.error('Stack trace:', parseError.stack);
  } else {
    console.error('Unknown error:', String(parseError));
  }
}
```

### Simple Normalization Approach

```typescript
try {
  // Some code that might throw
  parseCSV(data);
} catch (parseError) {
  // Simple and effective for logging
  console.error('CSV Parse Error:', String(parseError));
}
```

## Helper Functions for Error Handling

### Basic Error Normalizer

```typescript
function normalizeError(error: unknown): string {
  return String(error);
}

try {
  // Some code that might throw
} catch (error) {
  console.error('Error occurred:', normalizeError(error));
}
```

### Detailed Error Information

```typescript
function getErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: 'code' in error ? String((error as any).code) : undefined,
    };
  }

  return {
    message: String(error),
  };
}

try {
  // Some code that might throw
} catch (error) {
  const details = getErrorDetails(error);
  console.error('Error details:', details);
}
```

## Best Practices

1. **Always normalize errors** with `String(error)` for logging
2. **Use type guards** (`instanceof Error`) only when you need specific Error properties
3. **Create helper functions** to standardize error handling across your application
4. **Avoid assuming error types** in catch blocks
5. **Consider creating custom error classes** for specific error scenarios

## Example: Processing CSV Files

```typescript
async function processCSV(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const results = parseCSV(data);
    return results;
  } catch (parseError) {
    // Safe error handling
    console.error('CSV Parse Error:', String(parseError));

    // Re-throw with normalized message
    throw new Error(`Failed to process CSV: ${String(parseError)}`);
  }
}
```

By following these practices, you'll create more robust error handling that works with any type of error that might be thrown.
