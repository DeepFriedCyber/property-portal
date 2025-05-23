// scripts/setup-vector-index.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupVectorIndex() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Setting up vector index...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'vector_index_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL directly
    await prisma.$executeRawUnsafe(sql);
    
    console.log('Vector index setup completed successfully!');
  } catch (error) {
    console.error('Error setting up vector index:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupVectorIndex()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });