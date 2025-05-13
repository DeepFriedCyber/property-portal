import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create a postgres connection
const client = postgres(process.env.DATABASE_URL);

// Create a drizzle client
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };