import logger from '@lib/logging/simplified-logger';
import { PrismaClient } from '@prisma/client';

// Configure logger for this script
logger.configureLogger({
  minLevel: 'debug',
  enableConsole: true,
  environment: 'development',
});

logger.info('Logger initialized successfully!');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Define a type for the extension query result
type PgExtension = {
  extname: string;
  extversion: string;
  // Use a more specific type instead of any
  [key: string]: string | number | boolean | null;
};

async function main() {
  try {
    logger.info('Testing connection to Neon database...');
    
    // Test basic connection
    const databaseVersion = await prisma.$queryRaw<string>`SELECT version()`;
    logger.info('Connected to database', { version: databaseVersion });

    // Check available extensions
    const extensions = await prisma.$queryRaw<PgExtension[]>`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname
    `;
    
    logger.info('Available PostgreSQL extensions:', { count: extensions.length });
    extensions.forEach(ext => {
      logger.debug(`Extension: ${ext.extname}, version: ${ext.extversion}`);
    });

    // Test a simple query
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    logger.info('Current database time:', { time: result[0].now });

    logger.info('Database connection test completed successfully');
  } catch (error) {
    logger.error('Failed to connect to database', error instanceof Error ? error : new Error(String(error)));
  } finally {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
}

main();

