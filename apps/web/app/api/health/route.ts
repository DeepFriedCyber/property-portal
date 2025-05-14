// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseHealthy, getDatabaseStatus } from '@your-org/db';

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(req: NextRequest) {
  const dbStatus = getDatabaseStatus();
  const isDbHealthy = isDatabaseHealthy();
  
  const health = {
    status: isDbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus.status,
        healthy: isDbHealthy,
        error: dbStatus.error ? dbStatus.error.message : null
      },
      api: {
        status: 'RUNNING',
        healthy: true
      }
    }
  };
  
  // Return 503 if any service is unhealthy
  const statusCode = isDbHealthy ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}