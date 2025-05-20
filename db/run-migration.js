// db/run-migration.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration(migrationFile) {
  const client = await pool.connect();
  
  try {
    console.log(`Running migration: ${migrationFile}`);
    
    // Read the migration file
    const filePath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Run the migration
    await client.query(sql);
    
    // Record the migration in the migrations table
    await client.query(
      `INSERT INTO migrations (name, applied_at) VALUES ($1, NOW()) 
       ON CONFLICT (name) DO UPDATE SET applied_at = NOW()`,
      [migrationFile]
    );
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`Migration ${migrationFile} completed successfully`);
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error(`Migration ${migrationFile} failed:`, error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function ensureMigrationsTable() {
  const client = await pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL
      )
    `);
  } catch (error) {
    console.error('Failed to create migrations table:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get migration file from command line argument
    const migrationFile = process.argv[2];
    
    if (!migrationFile) {
      console.error('Please specify a migration file');
      process.exit(1);
    }
    
    // Run the migration
    await runMigration(migrationFile);
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the script
main();