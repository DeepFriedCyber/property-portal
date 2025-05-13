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
