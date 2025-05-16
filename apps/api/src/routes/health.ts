// health.ts
import { isDatabaseHealthy, getDatabaseStatus } from '@your-org/db';
import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isDbHealthy = isDatabaseHealthy();

  const health = {
    status: isDbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus.status,
        healthy: isDbHealthy,
        error: dbStatus.error ? dbStatus.error.message : null,
      },
      api: {
        status: 'RUNNING',
        healthy: true,
      },
    },
  };

  // Return 503 if any service is unhealthy
  const statusCode = isDbHealthy ? 200 : 503;

  res.status(statusCode).json(health);
});

/**
 * Detailed health check endpoint (admin only)
 * GET /health/details
 */
router.get('/details', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isDbHealthy = isDatabaseHealthy();

  const health = {
    status: isDbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: dbStatus.status,
        healthy: isDbHealthy,
        error: dbStatus.error
          ? {
              message: dbStatus.error.message,
              stack: process.env.NODE_ENV === 'development' ? dbStatus.error.stack : undefined,
            }
          : null,
      },
      api: {
        status: 'RUNNING',
        healthy: true,
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV,
      },
    },
  };

  // Return 503 if any service is unhealthy
  const statusCode = isDbHealthy ? 200 : 503;

  res.status(statusCode).json(health);
});

export default router;
