// lib/logging/logger.ts
/**
 * Structured logging utility for the application
 *
 * This module provides a consistent interface for logging across the application.
 * It supports different log levels, structured metadata, and can be configured
 * to send logs to external services like Sentry or LogRocket.
 */

// Import from fixed-logger.ts to avoid duplicate exports
import logger, {
  LogLevel,
  configureLogger,
  setLogUser,
  setRequestId,
  debug,
  info,
  warn,
  error,
  fatal
} from './fixed-logger'

// Re-export everything
export {
  LogLevel,
  configureLogger,
  setLogUser,
  setRequestId,
  debug,
  info,
  warn,
  error,
  fatal
}

// Export the default logger
export default logger
