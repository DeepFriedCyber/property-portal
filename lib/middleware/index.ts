// lib/middleware/index.ts
import compression from 'compression'
import cors from 'cors'
import express, { Express } from 'express'
import helmet from 'helmet'

import { winstonLogger as logger } from '../logging/winston-logger'

import { errorHandler, requestIdMiddleware, notFoundHandler } from './errorHandler'

/**
 * Configure all middleware for the Express application
 * @param app Express application instance
 */
export function setupMiddleware(app: Express): void {
  // Request ID middleware (should be first to ensure all logs have request ID)
  app.use(requestIdMiddleware)

  // Security middleware
  app.use(helmet())

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['X-Request-ID'],
      credentials: true,
    })
  )

  // Body parsers
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

  // Compression
  app.use(compression())

  // Request logging middleware
  app.use((req, res, next) => {
    // Log at the start of the request
    const startTime = Date.now()

    logger.info(`Request started: ${req.method} ${req.path}`, {
      context: {
        method: req.method,
        path: req.path,
        query: req.query,
        requestId: req.id,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    })

    // Log when the response is finished
    res.on('finish', () => {
      const duration = Date.now() - startTime
      const level = res.statusCode >= 400 ? 'warn' : 'info'

      logger[level](
        `Request completed: ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`,
        {
          context: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            requestId: req.id,
          },
        }
      )
    })

    next()
  })

  // Note: Route handlers would be added here in the actual application

  // 404 handler - should be after all routes
  app.use(notFoundHandler)

  // Error handler - should be the last middleware
  app.use(errorHandler)
}

// Export all error handling utilities
export * from './errorHandler'
