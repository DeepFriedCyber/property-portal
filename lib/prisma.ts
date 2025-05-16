import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 *
 * Learn more:
 * https://pris.ly/d/help/next-js-best-practices
 */

// Declare global variable for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton PrismaClient instance
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Attach to global object in non-production environments to prevent multiple instances during hot reloading
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
