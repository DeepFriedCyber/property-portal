# Database Error Handling Best Practices

## The Problem with Generic Error Messages

When handling database errors, generic error messages like `Database connection error: ${err.message}` provide limited information for debugging. This approach:

1. Omits critical details about the connection attempt
2. Doesn't distinguish between different types of connection failures
3. Makes troubleshooting in production environments difficult

### ❌ Generic Error Handling

```typescript
try {
  await db.connect();
} catch (err) {
  console.error(`Database connection error: ${err.message}`);
  throw new Error(`Database connection error: ${err.message}`);
}
```

## Detailed Error Handling Approach

### ✅ Detailed Error Messages

```typescript
import { createDetailedDbConnectionErrorMessage } from '../lib/db/error-utils';

try {
  await db.connect();
} catch (err) {
  const detailedErrorMessage = createDetailedDbConnectionErrorMessage(err);
  console.error(detailedErrorMessage);
  throw new Error(detailedErrorMessage);
}
```

This produces error messages like:

```
Database connection error: connect ECONNREFUSED 127.0.0.1:5432 (Code: ECONNREFUSED) | Connection details: Host: 127.0.0.1, Port: 5432, Database: mydb, User: postgres
```

## Key Information to Include in Database Error Messages

1. **Error Type/Code**: Specific error code (e.g., `ECONNREFUSED`, `ETIMEDOUT`)
2. **Connection Details**: Host, port, database name (without sensitive credentials)
3. **Query Information**: For query errors, include the query that failed (sanitized)
4. **Timestamp**: When the error occurred
5. **Context**: What operation was being attempted

## Structured Error Objects for Logging

For logging systems or error tracking services, create structured error objects:

```typescript
import { createDbConnectionErrorObject } from '../lib/db/error-utils';

try {
  await db.connect();
} catch (err) {
  const errorObject = createDbConnectionErrorObject(err);
  logger.error('database_connection_failed', errorObject);
  throw new Error(errorObject.message);
}
```

## User-Friendly Error Messages

For user-facing applications, translate technical errors into user-friendly messages:

```typescript
import { getUserFriendlyDbErrorMessage } from '../lib/db/error-utils';

try {
  await db.connect();
} catch (err) {
  // Log the detailed technical error
  console.error(createDetailedDbConnectionErrorMessage(err));

  // Return a user-friendly message
  const userFriendlyMessage = getUserFriendlyDbErrorMessage(err);
  throw new Error(userFriendlyMessage);
}
```

## Common Database Error Types

| Error Code              | Description           | Possible Causes                                |
| ----------------------- | --------------------- | ---------------------------------------------- |
| `ECONNREFUSED`          | Connection refused    | Database server not running, firewall blocking |
| `ETIMEDOUT`             | Connection timeout    | Network issues, server overloaded              |
| `ENOTFOUND`             | Host not found        | Invalid hostname, DNS issues                   |
| `AUTHENTICATION_FAILED` | Authentication failed | Invalid username/password                      |
| `PERMISSION_DENIED`     | Permission denied     | Insufficient privileges                        |
| `DATABASE_NOT_FOUND`    | Database not found    | Database doesn't exist                         |

## Best Practices for Database Error Handling

1. **Log Detailed Technical Errors**: Include all relevant connection details
2. **Present User-Friendly Messages**: Don't expose technical details to end users
3. **Categorize Errors**: Handle different types of errors appropriately
4. **Include Context**: What operation was being performed when the error occurred
5. **Sanitize Sensitive Data**: Remove passwords and sensitive data before logging
6. **Implement Retry Logic**: For transient errors like connection timeouts
7. **Monitor Error Patterns**: Track recurring errors to identify systemic issues

## Example Implementation

```typescript
async function connectToDatabase(config) {
  try {
    const connection = await db.connect(config);
    return connection;
  } catch (err) {
    // Log detailed technical error for developers/operations
    const detailedError = createDetailedDbConnectionErrorMessage(err);
    logger.error(detailedError);

    // For monitoring/analytics systems
    const errorObject = createDbConnectionErrorObject(err);
    errorTracker.captureException(errorObject);

    // For user-facing applications
    const userMessage = getUserFriendlyDbErrorMessage(err);
    throw new Error(userMessage);
  }
}
```

By following these practices, you'll create more robust database error handling that provides valuable information for debugging while maintaining appropriate abstraction for end users.
