<<<<<<< HEAD
// apps/api/src/index.ts
import { startServer } from './server';
import { winstonLogger as logger } from '../../../lib/logging/winston-logger';

// Configure logger
logger.configureLogger({
  minLevel: 'debug',
  enableConsole: true,
  environment: process.env.NODE_ENV as 'development' | 'test' | 'production' || 'development',
  release: process.env.npm_package_version
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception', {
    error,
    context: {
      stack: error.stack
    }
  });
  
  // Exit with error
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled promise rejection', {
    error: reason instanceof Error ? reason : new Error(String(reason)),
    context: {
      reason: String(reason)
    }
  });
  
  // Exit with error
  process.exit(1);
});

// Start the server
const server = startServer();

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server...');
  
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force close after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
=======
// API entry point
<<<<<<< Updated upstream
// Using console.warn instead of console.log to comply with linting rules
console.warn('API server starting...')

// Add your API server implementation here
// Example:
// import express from 'express';
// const app = express();
// app.listen(3001, () => console.warn('API server running on port 3001'));
=======
import express from 'express';
import { env } from './env.mjs';

// Validate environment variables before starting the server
console.log(`API server starting in ${env.NODE_ENV} mode...`);

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// Add your API routes here
// Example: app.use('/api/properties', propertyRoutes);

// Start the server
const server = app.listen(env.PORT, () => {
  console.log(`✅ API server running on port ${env.PORT}`);
});
>>>>>>> Stashed changes
>>>>>>> clean-branch
