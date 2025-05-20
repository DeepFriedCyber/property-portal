/**
 * Script to apply database optimizations
 * 
 * This script:
 * 1. Applies the latest Prisma migrations
 * 2. Verifies the HNSW index was created correctly
 * 3. Tests the connection pool
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const POOL_SIZE = parseInt(process.env.POOL_SIZE || '10', 10);

// Create a connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: POOL_SIZE,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Create a Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database optimization process...');

    // Step 1: Apply Prisma migrations
    console.log('\n1. Applying Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations applied successfully');

    // Step 2: Verify the HNSW index was created
    console.log('\n2. Verifying HNSW index...');
    const indexResult = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Property' AND indexname = 'Property_embedding_hnsw_idx';
    `);

    if (indexResult.rows.length > 0) {
      console.log('✅ HNSW index verified:', indexResult.rows[0].indexdef);
    } else {
      console.error('❌ HNSW index not found. Please check the migration.');
      
      // Try to create the index manually if it doesn't exist
      console.log('Attempting to create the index manually...');
      await pool.query(`
        CREATE INDEX IF NOT EXISTS "Property_embedding_hnsw_idx" ON "Property" 
        USING hnsw (embedding vector_cosine_ops) 
        WITH (m = 16, ef_construction = 64);
      `);
      console.log('Manual index creation attempted. Please verify.');
    }

    // Step 3: Test the connection pool
    console.log('\n3. Testing connection pool...');
    const startTime = Date.now();
    
    // Run 10 concurrent queries to test the pool
    const promises = Array(10).fill(0).map((_, i) => 
      pool.query('SELECT NOW() as time')
        .then(res => console.log(`Query ${i+1} completed at ${res.rows[0].time}`))
    );
    
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Connection pool test completed in ${duration}ms`);

    console.log('\nDatabase optimization process completed successfully!');
  } catch (error) {
    console.error('Error during database optimization:', error);
    process.exit(1);
  } finally {
    // Clean up
    await prisma.$disconnect();
    await pool.end();
  }
}

main();