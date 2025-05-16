import { exec } from 'child_process';

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

console.log('Generating database migrations...');

// Run drizzle-kit generate command
exec('npx drizzle-kit generate:pg', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }

  console.log(`Migration files generated:\n${stdout}`);
});
