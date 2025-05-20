// lib/logging/winston-logger.ts
import fs from 'fs'
import path from 'path'

import { createLogger, format, transports } from 'winston'

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

/**
 * Sensitive fields that should never be logged
 * Add any field names that might contain sensitive information
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'authorization',
  'apiKey',
  'api_key',
  'key',
  'credential',
  'ssn',
  'socialSecurity',
  'creditCard',
  'cardNumber',
  'cvv',
]

/**
 * Sanitize data for logging by removing sensitive fields
 */
const sanitizeForLogging = format(info => {
  if (info.context) {
    const sanitized = { ...info.context }

    // Recursively sanitize objects
    const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {}

      for (const [key, value] of Object.entries(obj)) {
        // Check if this is a sensitive field
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]'
        }
        // Recursively sanitize nested objects
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = sanitizeObject(value)
        }
        // Sanitize arrays
        else if (Array.isArray(value)) {
          result[key] = value.map(item =>
            typeof item === 'object' && item !== null ? sanitizeObject(item) : item
          )
        }
        // Pass through other values
        else {
          result[key] = value
        }
      }

      return result
    }

    info.context = sanitizeObject(sanitized)
  }

  return info
})

/**
 * Custom format for console output
 * Colorizes the level and formats the message in a readable way
 */
const consoleFormat = format.combine(
  sanitizeForLogging(),
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, context, stack }) => {
    // Format the context
    let contextStr = ''
    if (context) {
      contextStr = `\n${JSON.stringify(context, null, 2)}`
    }

    // Include stack trace for errors if available
    const stackStr = stack ? `\n${stack}` : ''

    // Format the log message
    return `${timestamp} ${level}: ${message}${contextStr}${stackStr}`
  })
)

/**
 * Format for file output
 * Includes timestamp, level, message, and metadata in JSON format
 */
const fileFormat = format.combine(
  sanitizeForLogging(),
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
)

/**
 * Create the Winston logger
 */
export const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'property-portal',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport with custom format
    new transports.Console({
      format: consoleFormat,
    }),

    // Error log file
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),

    // Combined log file (all levels)
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
  ],

  // Don't exit on handled exceptions
  exitOnError: false,
})

/**
 * Add request context to log entries
 * @param req Express request object
 * @returns Logger with request context
 */
export function loggerWithRequest(req: any) {
  return {
    debug: (message: string, meta: Record<string, any> = {}) =>
      winstonLogger.debug(message, {
        context: {
          ...meta,
          requestId: req.id,
          path: req.path,
          method: req.method,
        },
      }),

    info: (message: string, meta: Record<string, any> = {}) =>
      winstonLogger.info(message, {
        context: {
          ...meta,
          requestId: req.id,
          path: req.path,
          method: req.method,
        },
      }),

    warn: (message: string, meta: Record<string, any> = {}) =>
      winstonLogger.warn(message, {
        context: {
          ...meta,
          requestId: req.id,
          path: req.path,
          method: req.method,
        },
      }),

    error: (message: string, error?: Error, meta: Record<string, any> = {}) =>
      winstonLogger.error(message, {
        context: {
          ...meta,
          requestId: req.id,
          path: req.path,
          method: req.method,
        },
        stack: error?.stack,
      }),
  }
}

// Export default logger
export default winstonLogger
