import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema'; // Import the schema
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

// Initialize Drizzle client WITH the schema
export const db = drizzle(pool, { schema }); // Pass schema here
export { pool };
export { schema }; // Export the schema itself

/**
 * Check if the database is healthy by performing a simple query
 * @returns Promise<boolean> - True if the database is healthy, false otherwise
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    // Try to execute a simple query to check database connectivity
    const result = await pool.query('SELECT 1');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get detailed database status information
 * @returns Promise<object> - Object containing database status information
 */
export async function getDatabaseStatus(): Promise<{
  healthy: boolean;
  poolSize: number;
  idleConnections: number;
  waitingClients: number;
  error?: string;
}> {
  try {
    // Check if the database is healthy
    const healthy = await isDatabaseHealthy();
    
    // Get pool statistics
    const poolStats = {
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount
    };
    
    return {
      healthy,
      ...poolStats
    };
  } catch (error) {
    return {
      healthy: false,
      poolSize: 0,
      idleConnections: 0,
      waitingClients: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
