import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL
const POOL_SIZE = parseInt(process.env.POOL_SIZE || '10', 10)

// Connection pool configuration
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: POOL_SIZE, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
  ssl: {
    rejectUnauthorized: false, // Required for Neon Postgres
  },
})

// Log pool events for monitoring
pool.on('connect', () => {
  console.log('Database pool connection established')
})

pool.on('error', err => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Create a custom Prisma client with connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: ['query', 'error', 'warn'],
  })
}

// Use global to maintain a single instance across hot reloads in development
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Export the Prisma client singleton
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
