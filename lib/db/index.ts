import * as schema from '../../drizzle/schema';
import * as dotenv from 'dotenv';
import { 
  connectionManager, 
  getDb, 
  initializeDatabase, 
  closeDatabase, 
  getDatabaseStatus 
} from './connection-manager';
import { DatabaseConnectionError } from './error-handler';

// Load environment variables
dotenv.config();

// Initialize the database connection
try {
  // This will be executed when this module is imported
  // We use a self-invoking async function to handle the async initialization
  (async () => {
    try {
      await initializeDatabase(process.env.DATABASE_URL, {
        ssl: process.env.NODE_ENV === 'production',
        max: 10, // Default pool size
        idle_timeout: 30, // 30 seconds
        connect_timeout: 10, // 10 seconds
        max_lifetime: 60 * 60, // 1 hour
        healthCheckIntervalMs: 30000 // 30 seconds
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      // We don't throw here to allow the application to start
      // The connection manager will attempt to reconnect
    }
  })();
} catch (error) {
  console.error('Error in database initialization:', error);
}

// Export the database client
// This will throw an error if the connection is not available
// Consumers should handle this error appropriately
export const db = getDb();

// Export schema for convenience
export { schema };

// Export connection management functions
export { 
  initializeDatabase, 
  closeDatabase, 
  getDatabaseStatus 
};

/**
 * Check if the database connection is healthy
 * @returns True if the connection is healthy, false otherwise
 */
export function isDatabaseHealthy(): boolean {
  const status = getDatabaseStatus();
  return status.status === 'CONNECTED';
}

/**
 * Get a database client with connection check
 * @param throwOnError Whether to throw an error if the connection is not available
 * @returns Database client or null if not available and throwOnError is false
 */
export function getDatabase(throwOnError = true) {
  try {
    return getDb();
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    return null;
  }
}

/**
 * Execute a function with a database connection
 * @param fn Function to execute with the database connection
 * @param retries Number of retries if the connection fails
 * @returns Result of the function
 */
export async function withDatabase<T>(fn: (db: ReturnType<typeof getDb>) => Promise<T>, retries = 3): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const database = getDb();
      return await fn(database);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's not a connection error, just throw it
      if (!(error instanceof DatabaseConnectionError)) {
        throw error;
      }
      
      // Don't retry if we've reached max retries
      if (attempt === retries) {
        break;
      }
      
      // Wait before retrying
      const delay = 1000 * Math.pow(2, attempt);
      console.log(`Database connection failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new DatabaseConnectionError('Failed to execute database operation after retries');
}