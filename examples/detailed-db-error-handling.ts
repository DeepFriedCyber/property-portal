/**
 * Example of detailed database error handling
 */

import {
  createDetailedDbConnectionErrorMessage,
  createDbConnectionErrorObject,
  getUserFriendlyDbErrorMessage,
} from '../lib/db/error-utils'

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
    // ❌ BAD: Generic error message
    // console.error('Database connection error:', err.message);
    // throw new Error(`Database connection error: ${err.message}`);

    // ✅ GOOD: Detailed error message with connection details
    const detailedErrorMessage = createDetailedDbConnectionErrorMessage(err)
    console.error(detailedErrorMessage)

    // For logging systems or error tracking services
    const errorObject = createDbConnectionErrorObject(err)
    logError('database_connection_failed', errorObject)

    // For user-facing errors, provide a friendly message
    const userFriendlyMessage = getUserFriendlyDbErrorMessage(err)
    throw new Error(userFriendlyMessage)
  }
}

/**
 * Example of handling database query errors with detailed information
 */
async function executeQuery(query: string, params: any[]) {
  try {
    // Simulated query execution
    const result = await simulateQueryExecution(query, params)
    return result
  } catch (err) {
    // ❌ BAD: Generic error message
    // console.error('Query error:', err.message);
    // throw new Error(`Query error: ${err.message}`);

    // ✅ GOOD: Detailed error message with query information
    const errorObj = err as Record<string, any>
    const detailedErrorMessage = `Database query error: ${errorObj.message || 'Unknown error'} | Query: ${query} | Parameters: ${JSON.stringify(params)}`

    if (errorObj.code) {
      detailedErrorMessage += ` | Error Code: ${errorObj.code}`
    }

    if (errorObj.position) {
      detailedErrorMessage += ` | Position: ${errorObj.position}`
    }

    console.error(detailedErrorMessage)
    throw new Error(detailedErrorMessage)
  }
}

/**
 * Example of handling database transaction errors
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
    // Rollback transaction if it exists
    if (transaction) {
      try {
        await simulateTransactionRollback(transaction)
      } catch (rollbackErr) {
        // ❌ BAD: Generic rollback error message
        // console.error('Transaction rollback error:', rollbackErr.message);

        // ✅ GOOD: Detailed rollback error message
        console.error(
          `Transaction rollback error: ${String(rollbackErr)} | Original error: ${String(err)}`
        )
      }
    }

    // ❌ BAD: Generic error message
    // console.error('Transaction error:', err.message);
    // throw new Error(`Transaction error: ${err.message}`);

    // ✅ GOOD: Detailed error message with transaction information
    const errorObj = err as Record<string, any>
    const detailedErrorMessage = `Database transaction error: ${errorObj.message || 'Unknown error'} | Queries: ${queries.length}`

    if (errorObj.code) {
      detailedErrorMessage += ` | Error Code: ${errorObj.code}`
    }

    if (errorObj.query) {
      detailedErrorMessage += ` | Failed Query: ${errorObj.query}`
    }

    console.error(detailedErrorMessage)
    throw new Error(detailedErrorMessage)
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
  // Simulate query execution
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

function logError(code: string, details: any) {
  // Simulate error logging to a service
  console.log(`[ERROR_LOG] ${code}:`, JSON.stringify(details, null, 2))
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
  } catch (err) {
    console.error('Main error handler:', err.message)
  }

  try {
    // This will fail with a detailed error message
    const connection = await connectToDatabase({
      host: 'invalid-host',
      port: 5432,
      database: 'mydb',
      user: 'postgres',
      password: 'password',
    })
  } catch (err) {
    console.error('Main error handler:', err.message)
  }
}

export { connectToDatabase, executeQuery, executeTransaction }
