import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default {
  schema: './apps/api/lib/schema.ts',
  out: './drizzle',
  // Specify the database dialect (PostgreSQL)
  dialect: 'postgresql',
  dbCredentials: {
    // Using the PostgreSQL connection string
    url: process.env.DATABASE_URL || '',
  },
  // Customize table names format
  tablesFilter: ['properties_*', 'users_*', 'flagged_properties_*'],
  // Verbose output for debugging
  verbose: true,
  // Strict mode ensures type safety
  strict: true,
} satisfies Config;