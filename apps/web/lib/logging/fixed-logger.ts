// lib/logging/fixed-logger.ts

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

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Logger configuration interface
export interface LoggerConfig {
  environment?: string
  release?: string
  sentryDsn?: string
  logRocketAppId?: string
  consoleLevel?: LogLevel
  serverLogLevel?: LogLevel
  sentryLevel?: LogLevel
  logRocketLevel?: LogLevel
  enableConsole?: boolean
  enableSentry?: boolean
  enableLogRocket?: boolean
  enableServerLogs?: boolean
  maskSensitiveData?: boolean
}

// Default configuration
const defaultConfig: LoggerConfig = {
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_VERSION || '0.0.0',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  logRocketAppId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID,
  consoleLevel: LogLevel.DEBUG,
  serverLogLevel: LogLevel.INFO,
  sentryLevel: LogLevel.ERROR,
  logRocketLevel: LogLevel.INFO,
  enableConsole: true,
  enableSentry: process.env.NODE_ENV === 'production',
  enableLogRocket: process.env.NODE_ENV === 'production',
  enableServerLogs: process.env.NODE_ENV === 'production',
  maskSensitiveData: true,
}

// Current configuration
let loggerConfig: LoggerConfig = { ...defaultConfig }

// Initialize with custom configuration
export function configureLogger(config: Partial<LoggerConfig>): void {
  loggerConfig = {
    ...defaultConfig,
    ...config,
  }
}

// User information for logging
let userId: string | null = null
let userEmail: string | null = null

// Request ID for correlation
let requestId: string | null = null

/**
 * Set user information for logging
 */
export function setLogUser(id: string, email?: string): void {
  userId = id
  userEmail = email || null
}

/**
 * Set request ID for correlation
 */
export function setRequestId(id: string): void {
  requestId = id
}

/**
 * Mask sensitive data in objects
 */
function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  if (!loggerConfig.maskSensitiveData) {
    return data
  }

  const maskedData: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    // Check if the key contains any sensitive field names
    const isSensitive = SENSITIVE_FIELDS.some(field =>
      key.toLowerCase().includes(field.toLowerCase())
    )

    if (isSensitive) {
      maskedData[key] = '[REDACTED]'
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively mask nested objects
      maskedData[key] = maskSensitiveData(value as Record<string, unknown>)
    } else {
      maskedData[key] = value
    }
  }

  return maskedData
}

/**
 * Format log entry for console output
 */
function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(maskSensitiveData(context))}` : ''
  const errorStr = error ? ` ${error.stack || error.message}` : ''
  const userStr = userId ? ` user=${userId}` : ''
  const requestStr = requestId ? ` reqId=${requestId}` : ''

  return `[${timestamp}] [${level.toUpperCase()}]${userStr}${requestStr} ${message}${contextStr}${errorStr}`
}

/**
 * Log to console
 */
function logToConsole(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): void {
  if (!loggerConfig.enableConsole) return

  const logLevels = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.FATAL]: 4,
  }

  // Only log if the level is at or above the configured level
  if (logLevels[level] < logLevels[loggerConfig.consoleLevel || LogLevel.DEBUG]) {
    return
  }

  const formattedMessage = formatLogEntry(level, message, context, error)

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage)
      break
    case LogLevel.INFO:
      console.info(formattedMessage)
      break
    case LogLevel.WARN:
      console.warn(formattedMessage)
      break
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formattedMessage)
      break
  }
}

/**
 * Log a message at DEBUG level
 */
export function debug(message: string, context?: Record<string, unknown>, tags?: string[]): void {
  logToConsole(LogLevel.DEBUG, message, context)
}

/**
 * Log a message at INFO level
 */
export function info(message: string, context?: Record<string, unknown>, tags?: string[]): void {
  logToConsole(LogLevel.INFO, message, context)
}

/**
 * Log a message at WARN level
 */
export function warn(message: string, context?: Record<string, unknown>, tags?: string[]): void {
  logToConsole(LogLevel.WARN, message, context)
}

/**
 * Log a message at ERROR level
 */
export function error(
  message: string,
  errorObj?: Error,
  context?: Record<string, unknown>,
  tags?: string[]
): void {
  logToConsole(LogLevel.ERROR, message, context, errorObj)
}

/**
 * Log a message at FATAL level
 */
export function fatal(
  message: string,
  errorObj?: Error,
  context?: Record<string, unknown>,
  tags?: string[]
): void {
  logToConsole(LogLevel.FATAL, message, context, errorObj)
}

// Export a default logger object
export default {
  debug,
  info,
  warn,
  error,
  fatal,
  setLogUser,
  setRequestId,
  configureLogger,
}
