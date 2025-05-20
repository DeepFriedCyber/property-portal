import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import pgvector from 'pgvector';

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const POOL_SIZE = parseInt(process.env.POOL_SIZE || '10', 10);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Connection pool configuration for Neon Postgres
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: POOL_SIZE, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
  ssl: {
    rejectUnauthorized: false, // Required for Neon Postgres
  },
});

// Log pool events for monitoring
pool.on('connect', () => {
  if (!IS_PRODUCTION) {
    console.log('Database pool connection established');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  if (IS_PRODUCTION) {
    // In production, we might want to handle this more gracefully
    process.exit(-1);
  }
});

// Create a singleton PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize PrismaClient with connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: IS_PRODUCTION ? ['error'] : ['query', 'error', 'warn'],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Export pgvector for use with Prisma
export { pgvector, pool };

// Keep the same instance during development hot reloads
if (!IS_PRODUCTION) globalForPrisma.prisma = prisma;

// Graceful shutdown to properly close the connection pool
const handleShutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
