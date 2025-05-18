import { PrismaClient } from '@prisma/client'
import pgvector from 'pgvector'

// Create a singleton PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Export pgvector for use with Prisma
export { pgvector }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
