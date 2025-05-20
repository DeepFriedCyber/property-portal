/**
 * Centralized logging utility for consistent logging across the application
 */
import { createLogger, format, transports } from 'winston'

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production'

// Create the logger with the desired configuration
export const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'property-portal' },
  transports: [
    // Write all logs to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...metadata }) => {
          let metaStr = ''
          if (metadata && Object.keys(metadata).length > 0) {
            if (metadata.stack) {
              // Format stack traces specially
              metaStr = `\n${metadata.stack}`
              delete metadata.stack
            }

            // Format remaining metadata if any
            if (Object.keys(metadata).length > 0) {
              metaStr += `\n${JSON.stringify(metadata, null, 2)}`
            }
          }
          return `${timestamp} ${level}: ${message}${metaStr}`
        })
      ),
    }),
  ],
})

// Add file transports in production
if (isProduction) {
  // Log everything to a combined log file
  logger.add(
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )

  // Log errors separately
  logger.add(
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
}

// Create a stream object for Morgan HTTP request logging
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}

// Export convenience methods for use throughout the application
export default {
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
}
