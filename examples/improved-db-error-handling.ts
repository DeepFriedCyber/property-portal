/**
 * Example of improved database error handling with error classification
 */

import { getUserFriendlyDbErrorMessage, DbErrorCode } from '../lib/db/error-utils'

/**
 * Database error categories for better error handling
 */
enum DbErrorCategory {
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  QUERY = 'QUERY',
  TRANSACTION = 'TRANSACTION',
  TIMEOUT = 'TIMEOUT',
  CONSTRAINT = 'CONSTRAINT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Interface for classified database errors
 */
interface ClassifiedDbError {
  category: DbErrorCategory
  code: string | null
  message: string
  details: Record<string, any>
  originalError: unknown
  isRetryable: boolean
}

/**
 * Classifies database errors into meaningful categories
 * @param err The original error
 * @returns A classified error object
 */
function classifyDbError(err: unknown): ClassifiedDbError {
  if (!err || typeof err !== 'object') {
    return {
      category: DbErrorCategory.UNKNOWN,
      code: null,
      message: String(err),
      details: {},
      originalError: err,
      isRetryable: false,
    }
  }

  const errorObj = err as Record<string, any>
  const code = errorObj.code
  const message = errorObj.message || 'Unknown database error'

  // Default classification
  let category = DbErrorCategory.UNKNOWN
  let isRetryable = false

  // Classify based on error code
  if (code) {
    switch (code) {
      // Connection errors
      case DbErrorCode.CONNECTION_REFUSED:
      case DbErrorCode.CONNECTION_RESET:
      case DbErrorCode.HOST_NOT_FOUND:
        category = DbErrorCategory.CONNECTION
        isRetryable = true
        break

      // Authentication errors
      case DbErrorCode.AUTHENTICATION_FAILED:
        category = DbErrorCategory.AUTHENTICATION
        isRetryable = false
        break

      // Permission errors
      case DbErrorCode.PERMISSION_DENIED:
        category = DbErrorCategory.PERMISSION
        isRetryable = false
        break

      // Timeout errors
      case DbErrorCode.CONNECTION_TIMEOUT:
        category = DbErrorCategory.TIMEOUT
        isRetryable = true
        break

      // Database-specific error codes
      case '23505': // PostgreSQL unique violation
      case 'ER_DUP_ENTRY': // MySQL duplicate entry
        category = DbErrorCategory.CONSTRAINT
        isRetryable = false
        break

      // Transaction errors
      case '40001': // PostgreSQL serialization failure
      case 'ER_LOCK_DEADLOCK': // MySQL deadlock
        category = DbErrorCategory.TRANSACTION
        isRetryable = true
        break

      default:
        // Try to classify based on error message patterns
        if (message.includes('query') || message.includes('sql syntax')) {
          category = DbErrorCategory.QUERY
          isRetryable = false
        } else if (message.includes('transaction')) {
          category = DbErrorCategory.TRANSACTION
          isRetryable = true
        }
    }
  }

  // Extract relevant details based on the error category
  const details: Record<string, any> = {}

  // Common details
  if (errorObj.host) details.host = errorObj.host
  if (errorObj.port) details.port = errorObj.port
  if (errorObj.database) details.database = errorObj.database

  // Category-specific details
  switch (category) {
    case DbErrorCategory.QUERY:
      if (errorObj.query) details.query = errorObj.query
      if (errorObj.parameters) details.parameters = errorObj.parameters
      if (errorObj.position) details.position = errorObj.position
      break

    case DbErrorCategory.CONSTRAINT:
      if (errorObj.constraint) details.constraint = errorObj.constraint
      if (errorObj.table) details.table = errorObj.table
      if (errorObj.column) details.column = errorObj.column
      break

    case DbErrorCategory.TRANSACTION:
      if (errorObj.transactionId) details.transactionId = errorObj.transactionId
      break
  }

  return {
    category,
    code,
    message,
    details,
    originalError: err,
    isRetryable,
  }
}

/**
 * Example database connection function with improved error handling
 */
async function connectToDatabase(config: {
  host: string
  port: number
  database: string
  user: string
  password: string
}) {
  try {
    // Simulated database connection
    const connection = await simulateDatabaseConnection(config)
    return connection
  } catch (err) {
    // Classify the error
    const classifiedError = classifyDbError(err)

    // Log detailed error information
    console.error(`Database error [${classifiedError.category}]:`, {
      code: classifiedError.code,
      message: classifiedError.message,
      details: classifiedError.details,
      isRetryable: classifiedError.isRetryable,
    })

    // Handle based on error category
    switch (classifiedError.category) {
      case DbErrorCategory.CONNECTION:
        // For connection errors, we might want to retry
        if (classifiedError.isRetryable) {
          console.log('Connection error is retryable, attempting reconnect...')
          // Implement retry logic here
        }
        break

      case DbErrorCategory.AUTHENTICATION:
        // For auth errors, we might want to alert administrators
        console.error('Authentication error - credentials may need updating')
        break

      case DbErrorCategory.PERMISSION:
        // For permission errors, we might need to check user roles
        console.error('Permission error - check database user permissions')
        break
    }

    // For user-facing errors, provide a friendly message
    const userFriendlyMessage = getUserFriendlyDbErrorMessage(err)
    throw new Error(userFriendlyMessage)
  }
}

/**
 * Example of handling database query errors with improved classification
 */
async function executeQuery(query: string, params: any[]) {
  try {
    // Simulated query execution
    const result = await simulateQueryExecution(query, params)
    return result
  } catch (err) {
    // Classify the error
    const classifiedError = classifyDbError(err)

    // Log detailed error information
    console.error(`Query error [${classifiedError.category}]:`, {
      code: classifiedError.code,
      message: classifiedError.message,
      query,
      params,
      details: classifiedError.details,
      isRetryable: classifiedError.isRetryable,
    })

    // Handle specific error categories
    switch (classifiedError.category) {
      case DbErrorCategory.CONSTRAINT:
        // For constraint violations, return a specific error
        throw new Error(`Data validation error: ${classifiedError.message}`)

      case DbErrorCategory.QUERY:
        // For query syntax errors, this is likely a programming issue
        console.error('Query syntax error - check the query structure')
        throw new Error('Invalid query structure')

      case DbErrorCategory.TRANSACTION:
        // For transaction errors, we might want to retry
        if (classifiedError.isRetryable) {
          console.log('Transaction error is retryable, could attempt retry...')
          // Implement retry logic here
        }
        break

      default:
        // For other errors, throw with the classified message
        throw new Error(`Database error: ${classifiedError.message}`)
    }
  }
}

/**
 * Example of handling database transaction errors with improved classification
 */
async function executeTransaction(queries: { sql: string; params: any[] }[]) {
  let transaction: any = null

  try {
    // Simulated transaction start
    transaction = await simulateTransactionStart()

    for (const { sql, params } of queries) {
      await simulateQueryExecution(sql, params, transaction)
    }

    // Simulated transaction commit
    await simulateTransactionCommit(transaction)

    return { success: true }
  } catch (err) {
    // Classify the error
    const classifiedError = classifyDbError(err)

    // Attempt rollback if transaction exists
    if (transaction) {
      try {
        await simulateTransactionRollback(transaction)
        console.log('Transaction successfully rolled back')
      } catch (rollbackErr) {
        // Classify rollback error
        const rollbackClassifiedError = classifyDbError(rollbackErr)
        console.error(`Rollback failed [${rollbackClassifiedError.category}]:`, {
          code: rollbackClassifiedError.code,
          message: rollbackClassifiedError.message,
          details: rollbackClassifiedError.details,
          originalError: classifiedError.message, // Include original error
        })
      }
    }

    // Log detailed error information
    console.error(`Transaction error [${classifiedError.category}]:`, {
      code: classifiedError.code,
      message: classifiedError.message,
      details: classifiedError.details,
      isRetryable: classifiedError.isRetryable,
      queryCount: queries.length,
    })

    // Handle specific error categories
    switch (classifiedError.category) {
      case DbErrorCategory.TRANSACTION:
        if (classifiedError.isRetryable) {
          console.log('Transaction error is retryable, could attempt retry...')
          // Implement retry logic here
        }
        throw new Error(`Transaction failed: ${classifiedError.message}`)

      case DbErrorCategory.CONSTRAINT:
        throw new Error(`Data validation error: ${classifiedError.message}`)

      default:
        throw new Error(`Database transaction error: ${classifiedError.message}`)
    }
  }
}

// Mock functions for demonstration
async function simulateDatabaseConnection(config: any) {
  // Simulate different connection errors based on configuration
  if (config.host === 'localhost' && config.port === 5432) {
    return { connected: true }
  } else if (config.host === 'invalid-host') {
    throw {
      message: 'getaddrinfo ENOTFOUND invalid-host',
      code: 'ENOTFOUND',
      host: 'invalid-host',
      port: config.port,
    }
  } else if (config.port === 1234) {
    throw {
      message: 'connect ECONNREFUSED 127.0.0.1:1234',
      code: 'ECONNREFUSED',
      address: '127.0.0.1',
      port: 1234,
    }
  } else if (config.user === 'invalid-user') {
    throw {
      message: 'password authentication failed for user "invalid-user"',
      code: 'AUTHENTICATION_FAILED',
      host: config.host,
      port: config.port,
      user: 'invalid-user',
    }
  } else {
    throw {
      message: 'connection timeout',
      code: 'ETIMEDOUT',
      host: config.host,
      port: config.port,
    }
  }
}

async function simulateQueryExecution(query: string, params: any[], transaction?: any) {
  // Simulate different query errors based on the query
  if (query.includes('SELECT * FROM users')) {
    return { rows: [{ id: 1, name: 'Test User' }] }
  } else if (query.includes('SYNTAX ERROR')) {
    throw {
      message: 'syntax error at or near "SYNTAX"',
      code: '42601', // PostgreSQL syntax error
      position: '8',
      query,
    }
  } else if (query.includes('DUPLICATE')) {
    throw {
      message: 'duplicate key value violates unique constraint "users_email_key"',
      code: '23505', // PostgreSQL unique violation
      constraint: 'users_email_key',
      table: 'users',
      column: 'email',
      query,
    }
  } else if (query.includes('DEADLOCK')) {
    throw {
      message: 'deadlock detected',
      code: '40001', // PostgreSQL serialization failure
      transactionId: transaction?.id,
      query,
    }
  }

  // Default success case
  return { rows: [] }
}

async function simulateTransactionStart() {
  // Simulate transaction start
  return { id: 'tx-123' }
}

async function simulateTransactionCommit(transaction: any) {
  // Simulate transaction commit
  return true
}

async function simulateTransactionRollback(transaction: any) {
  // Simulate transaction rollback
  return true
}

// Example usage
async function main() {
  try {
    // This will succeed
    const connection = await connectToDatabase({
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      user: 'postgres',
      password: 'password',
    })
    console.log('Connected successfully')

    // Test query execution with different scenarios
    await executeQuery('SELECT * FROM users', [])

    try {
      await executeQuery('SELECT * FROM users WHERE SYNTAX ERROR', [])
    } catch (err) {
      console.error('Expected syntax error:', err.message)
    }

    try {
      await executeQuery('INSERT INTO users (email) VALUES (?) DUPLICATE', ['test@example.com'])
    } catch (err) {
      console.error('Expected constraint error:', err.message)
    }

    // Test transaction with deadlock
    try {
      await executeTransaction([
        { sql: 'UPDATE users SET status = ? WHERE id = ?', params: ['active', 1] },
        { sql: 'UPDATE accounts SET status = ? WHERE user_id = ? DEADLOCK', params: ['active', 1] },
      ])
    } catch (err) {
      console.error('Expected transaction error:', err.message)
    }
  } catch (err) {
    console.error('Main error handler:', err.message)
  }
}

export { connectToDatabase, executeQuery, executeTransaction, classifyDbError, DbErrorCategory }
