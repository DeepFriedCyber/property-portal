import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const runMigration = async () => {
  try {
    console.log('Starting database migration...');
    
    // Create a postgres connection
    const connectionString = process.env.DATABASE_URL;
    const sql = postgres(connectionString, { max: 1 });
    
    // Create a drizzle instance
    const db = drizzle(sql);
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Drizzle migrations completed successfully');
    
    // Run custom SQL migrations
    console.log('Running custom SQL migrations...');
    
    // Read and execute the auto_update_timestamp.sql file
    const autoUpdateTimestampPath = path.join(process.cwd(), 'drizzle', 'migrations', 'auto_update_timestamp.sql');
    
    if (fs.existsSync(autoUpdateTimestampPath)) {
      const autoUpdateTimestampSql = fs.readFileSync(autoUpdateTimestampPath, 'utf8');
      
      // Execute the SQL
      await sql.unsafe(autoUpdateTimestampSql);
      console.log('Auto-update timestamp triggers created successfully');
    } else {
      console.log('No custom SQL migrations found');
    }
    
    console.log('All migrations completed successfully');
    
    // Close the connection
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();