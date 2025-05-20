// apps/api/src/server.ts
import express from 'express';
import { setupMiddleware } from '../../../lib/middleware';
import { winstonLogger as logger } from '../../../lib/logging/winston-logger';
import { createRateLimitMiddleware } from '../../../lib/rate-limit/factory';

// Create Express application
const app = express();

// Apply all middleware (security, CORS, body parsers, logging, error handling)
setupMiddleware(app);

// Apply global rate limiting to all API routes
// This is a fallback to prevent abuse of endpoints that don't have specific rate limits
const globalRateLimiter = createRateLimitMiddleware({
  interval: 60 * 1000, // 1 minute
  maxRequests: 200,    // 200 requests per minute
  prefix: 'ratelimit:global:',
});

// Apply global rate limiter to all routes
app.use(globalRateLimiter);

// Define routes
import propertiesRoutes from './routes/properties';
import usersRoutes from './routes/users';
import searchRoutes from './routes/search';

// Apply routes
app.use('/api/properties', propertiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0'
  });
});

// Start the server
const PORT = process.env.PORT || 3001;

export function startServer() {
  return app.listen(PORT, () => {
    logger.info(`API server started on port ${PORT}`, {
      context: {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '0.0.0'
      }
    });
  });
}

export default app;