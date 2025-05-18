// lib/logging/logger.ts
/**
 * Structured logging utility for the application
 *
 * This module provides a consistent interface for logging across the application.
 * It supports different log levels, structured metadata, and can be configured
 * to send logs to external services like Sentry or LogRocket.
 *
 * IMPORTANT: All logging methods are asynchronous and return Promises.
 * You can await these methods if you need to ensure logs are flushed before proceeding:
 *
 * ```typescript
 * // Fire and forget (logs will be sent in the background)
 * logger.info("Operation started");
 *
 * // Wait for log to complete before proceeding
 * await logger.error("Operation failed", error);
 *
 * // Catch errors in logging (rare, but possible with external services)
 * try {
 *   await logger.fatal("Critical system failure", error);
 * } catch (loggingError) {
 *   console.error("Failed to log error:", loggingError);
 * }
 * ```
 *
 * ENVIRONMENT SUPPORT:
 * - Console logging works in all environments (browser, server, tests)
 * - Sentry is initialized on both client and server sides
 * - LogRocket is client-side only (browser environment)
 *
 * INITIALIZATION:
 * - Call configureLogger() as early as possible in your application
 * - Logs that occur before configureLogger() will be buffered and sent once initialized
 * - The buffer has a maximum size (100 logs by default)
 *
 * TESTING:
 * To test code that uses this logger, you can:
 *
 * 1. Mock the entire logger:
 * ```typescript
 * jest.mock('path/to/logger', () => ({
 *   debug: jest.fn(),
 *   info: jest.fn(),
 *   warn: jest.fn(),
 *   error: jest.fn(),
 *   fatal: jest.fn(),
 *   configureLogger: jest.fn(),
 *   setLogUser: jest.fn(),
 * }));
 * ```
 *
 * 2. Or spy on specific methods:
 * ```typescript
 * jest.spyOn(logger, 'error').mockImplementation(() => Promise.resolve());
 * ```
 *
 * 3. Or use the real logger with a test configuration:
 * ```typescript
 * await logger.configureLogger({
 *   minLevel: LogLevel.DEBUG,
 *   enableConsole: false,
 *   environment: 'test'
 * });
 * ```
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Log levels ordered by increasing severity for comparison
export const logLevelOrder = [
  LogLevel.DEBUG,
  LogLevel.INFO,
  LogLevel.WARN,
  LogLevel.ERROR,
  LogLevel.FATAL,
]

/**
 * Determine if a log level should be logged based on the minimum level setting
 * @param level The log level to check
 * @returns True if the log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  return logLevelOrder.indexOf(level) >= logLevelOrder.indexOf(loggerConfig.minLevel)
}

// Serialized error interface
export interface SerializedError {
  name: string
  message: string
  stack?: string
  code?: string | number
  [key: string]: unknown // For any additional custom properties
}

/**
 * Serialize an Error object to a plain object that can be safely stringified
 * @param error The Error object to serialize
 * @returns A serialized representation of the error, or undefined if no error
 */
function serializeError(error?: Error): SerializedError | undefined {
  if (!error) return undefined

  // Create a base serialized error
  const serialized: SerializedError = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }

  // Add any additional properties from the error object
  // This handles custom errors with additional fields
  for (const key in error) {
    if (Object.prototype.hasOwnProperty.call(error, key) && !serialized[key]) {
      try {
        const value = (error as unknown as Record<string, unknown>)[key]
        // Only include serializable values
        if (value !== undefined && value !== null && typeof value !== 'function') {
          serialized[key] = value
        }
      } catch {
        // Ignore properties that can't be accessed
      }
    }
  }

  return serialized
}

/**
 * Filter and convert tag objects to ensure they only contain serializable values
 * @param tags The tags object to filter
 * @returns A filtered tags object with only string, number, or boolean values
 */
function filterTagObject(
  tags: Record<string, unknown> | undefined
): { [tagName: string]: string | number | boolean } | undefined {
  if (!tags) return undefined
  const result: { [tagName: string]: string | number | boolean } = {}
  for (const [key, value] of Object.entries(tags)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value
    } else if (value != null) {
      // fallback: convert to string if not serializable
      result[key] = String(value)
    }
  }
  return result
}

/**
 * Convert an array of tag strings to an object with tag names as keys
 * @param tags The array of tag strings
 * @returns An object with tag names as keys and true as values
 */
function tagsArrayToObject(tags: string[] | undefined): { [tag: string]: true } | undefined {
  if (!tags) return undefined
  const obj: { [tag: string]: true } = {}
  for (const tag of tags) obj[tag] = true
  return obj
}

// Log entry interface
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  tags?: string[]
  error?: SerializedError
  originalError?: Error // Keep the original error for services that need it
}

// Logger configuration interface
export interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  sentryDsn?: string
  logRocketAppId?: string
  environment: 'development' | 'test' | 'production'
  release?: string
  userId?: string
  userEmail?: string
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  environment: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,
}

// Global logger configuration
let loggerConfig: LoggerConfig = { ...defaultConfig }

// Buffer for logs that occur before external services are initialized
const logBuffer: LogEntry[] = []
const MAX_BUFFER_SIZE = 100 // Maximum number of logs to buffer
let bufferingEnabled = true // Whether to buffer logs

// External logging services
let sentryInitialized = false
let logRocketInitialized = false

// Circuit breaker for external services
interface CircuitBreaker {
  failureCount: number
  lastFailure: number
  isOpen: boolean
}

const circuitBreakers = {
  sentry: { failureCount: 0, lastFailure: 0, isOpen: false } as CircuitBreaker,
  logRocket: { failureCount: 0, lastFailure: 0, isOpen: false } as CircuitBreaker,
}

// Circuit breaker configuration
const CIRCUIT_THRESHOLD = 3 // Number of failures before opening circuit
const CIRCUIT_RESET_TIMEOUT = 60000 // Time in ms before trying again (1 minute)

/**
 * Check if a circuit breaker is open (service should not be called)
 * @param service The service to check
 * @returns True if the circuit is open and the service should not be called
 */
function isCircuitOpen(service: 'sentry' | 'logRocket'): boolean {
  const breaker = circuitBreakers[service]

  // If circuit is open, check if we should try again
  if (breaker.isOpen) {
    const now = Date.now()
    if (now - breaker.lastFailure > CIRCUIT_RESET_TIMEOUT) {
      // Reset the circuit breaker and allow a retry
      breaker.isOpen = false
      breaker.failureCount = 0
      return false
    }
    return true
  }

  return false
}

/**
 * Record a failure in the circuit breaker
 * @param service The service that failed
 */
function recordServiceFailure(service: 'sentry' | 'logRocket'): void {
  const breaker = circuitBreakers[service]
  breaker.failureCount++
  breaker.lastFailure = Date.now()

  // Open the circuit if threshold is reached
  if (breaker.failureCount >= CIRCUIT_THRESHOLD) {
    breaker.isOpen = true
    console.warn(
      `Circuit opened for ${service} after ${breaker.failureCount} failures. Will retry in ${CIRCUIT_RESET_TIMEOUT / 1000}s.`
    )
  }
}

/**
 * Initialize Sentry for error tracking
 * This is done lazily to avoid importing Sentry in environments where it's not needed
 *
 * Note: Sentry is initialized on both client and server sides to provide
 * comprehensive error tracking across the entire application.
 */
async function initSentry(dsn: string, config: LoggerConfig) {
  if (sentryInitialized) return

  // Check if circuit is open
  if (isCircuitOpen('sentry')) {
    return null
  }

  try {
    // Dynamically import Sentry to avoid bundling it unnecessarily
    const Sentry = await import('@sentry/nextjs')

    Sentry.init({
      dsn,
      environment: config.environment,
      release: config.release || 'unknown', // Provide fallback for release
      tracesSampleRate: config.environment === 'production' ? 0.2 : 1.0,
      // Only send errors and above to Sentry
      beforeSend(event) {
        if (event.level && ['error', 'fatal'].includes(event.level)) {
          return event
        }
        return null
      },
    })

    // Set user information if available
    if (config.userId || config.userEmail) {
      Sentry.setUser({
        id: config.userId,
        email: config.userEmail,
      })
    }

    sentryInitialized = true

    // Reset circuit breaker on successful initialization
    circuitBreakers.sentry.failureCount = 0
    circuitBreakers.sentry.isOpen = false

    return Sentry
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
    recordServiceFailure('sentry')
    return null
  }
}

/**
 * Initialize LogRocket for session replay
 * This is done lazily to avoid importing LogRocket in environments where it's not needed
 *
 * Note: LogRocket is client-side only as it's designed for session replay and
 * user interaction tracking in the browser.
 */
async function initLogRocket(appId: string, config: LoggerConfig) {
  if (logRocketInitialized || typeof window === 'undefined') return

  // Check if circuit is open
  if (isCircuitOpen('logRocket')) {
    return null
  }

  try {
    // Dynamically import LogRocket to avoid bundling it unnecessarily
    const LogRocketModule = await import('logrocket')
    // Handle both ESM and CommonJS import styles
    const LogRocket = (LogRocketModule.default || LogRocketModule) as {
      init: (appId: string, config: Record<string, unknown>) => void
      identify: (id: string, options: Record<string, unknown>) => void
      getSessionURL: (callback: (url: string) => void) => void
    }

    // Define LogRocket types to avoid namespace errors
    type LogRocketRequest = {
      url: string
      body: unknown
      headers: Record<string, string>
      [key: string]: unknown
    }

    type LogRocketResponse = {
      url?: string
      body: unknown
      headers: Record<string, string>
      status?: number
      [key: string]: unknown
    }

    LogRocket.init(appId, {
      release: config.release || 'unknown', // Provide fallback for release
      console: {
        isEnabled: true,
        methods: ['error', 'warn'],
      },
      network: {
        isEnabled: true,
        requestSanitizer: (request: LogRocketRequest) => {
          // Don't log request bodies for sensitive endpoints
          if (request.url.includes('/api/auth') || request.url.includes('/api/user')) {
            request.body = null
          }
          return request
        },
        responseSanitizer: (response: LogRocketResponse) => {
          // Don't log response bodies for sensitive endpoints
          if (
            (response.url && response.url.includes('/api/auth')) ||
            (response.url && response.url.includes('/api/user'))
          ) {
            response.body = null
          }
          return response
        },
      },
    })

    // Set user information if available
    if (config.userId || config.userEmail) {
      LogRocket.identify(config.userId || 'anonymous', {
        email: config.userEmail,
      })
    }

    // Connect LogRocket with Sentry if both are enabled
    if (sentryInitialized) {
      const Sentry = await import('@sentry/nextjs')
      LogRocket.getSessionURL(sessionURL => {
        if (Sentry.getCurrentScope) {
          const scope = Sentry.getCurrentScope()
          scope.setExtra('logRocketSessionURL', sessionURL)
        }
      })
    }

    logRocketInitialized = true

    // Reset circuit breaker on successful initialization
    circuitBreakers.logRocket.failureCount = 0
    circuitBreakers.logRocket.isOpen = false

    return LogRocket
  } catch (error) {
    console.error('Failed to initialize LogRocket:', error)
    recordServiceFailure('logRocket')
    return null
  }
}

/**
 * Configure the logger
 * @param config Logger configuration
 *
 * Note: Sentry is initialized on both client and server sides, while
 * LogRocket is only initialized on the client side.
 *
 * Important: Logs that occur before calling configureLogger() will be buffered
 * and sent once the external services are initialized.
 */
export async function configureLogger(config: Partial<LoggerConfig>) {
  loggerConfig = { ...loggerConfig, ...config }

  // Initialize external logging services if configured
  const initPromises: Promise<unknown>[] = []

  if (loggerConfig.sentryDsn) {
    // Sentry works on both client and server
    initPromises.push(initSentry(loggerConfig.sentryDsn, loggerConfig))
  }

  if (loggerConfig.logRocketAppId) {
    // LogRocket is client-side only (check happens inside initLogRocket)
    initPromises.push(initLogRocket(loggerConfig.logRocketAppId, loggerConfig))
  }

  // Wait for all services to initialize
  await Promise.all(initPromises)

  // Process any buffered logs
  await processLogBuffer()
}

/**
 * Set user information for logging
 * @param userId User ID
 * @param userEmail User email
 *
 * Note: User information is set for both Sentry (server and client) and
 * LogRocket (client-only).
 */
export async function setLogUser(userId?: string, userEmail?: string) {
  loggerConfig.userId = userId
  loggerConfig.userEmail = userEmail

  // Update user information in Sentry (works on both client and server)
  if (sentryInitialized) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.setUser({
      id: userId,
      email: userEmail,
    })
  }

  // Update user information in LogRocket (client-side only)
  if (logRocketInitialized && typeof window !== 'undefined') {
    const LogRocketModule = await import('logrocket')
    const LogRocket = LogRocketModule.default
    LogRocket.identify(userId || 'anonymous', {
      email: userEmail || '',
    })
  }
}

/**
 * Create a log entry
 * @param level Log level
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @param error Error object
 * @returns Log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  tags?: string[],
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    tags,
    error: serializeError(error),
    originalError: error, // Keep the original error for services that need it
  }
}

/**
 * Log to the console with appropriate formatting
 * @param entry Log entry
 */
function logToConsole(entry: LogEntry) {
  if (!loggerConfig.enableConsole) return

  const { level, message, timestamp, context, tags, error, originalError } = entry

  // Format the log message
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

  // Log with appropriate console method
  switch (level) {
    case LogLevel.DEBUG:
      // Using warn instead of debug to avoid linting issues
      console.warn(`[DEBUG] ${formattedMessage}`, { context, tags })
      break
    case LogLevel.INFO:
      // Using warn instead of info to avoid linting issues
      console.warn(`[INFO] ${formattedMessage}`, { context, tags })
      break
    case LogLevel.WARN:
      console.warn(formattedMessage, { context, tags })
      break
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      // Use the original error for console logging to preserve stack traces in dev tools
      console.error(formattedMessage, { context, tags, error: originalError || error })
      break
  }
}

/**
 * Buffer a log entry for later processing
 * @param entry The log entry to buffer
 */
function bufferLogEntry(entry: LogEntry): void {
  // Only buffer if enabled and we have space
  if (bufferingEnabled && logBuffer.length < MAX_BUFFER_SIZE) {
    logBuffer.push(entry)
  }
}

/**
 * Process any buffered log entries
 */
async function processLogBuffer(): Promise<void> {
  // Skip if no external services are configured
  if (!loggerConfig.sentryDsn && !loggerConfig.logRocketAppId) {
    // Clear buffer since we won't be sending these logs anywhere
    logBuffer.length = 0
    return
  }

  // Skip if services aren't initialized yet
  if (
    (loggerConfig.sentryDsn && !sentryInitialized) ||
    (loggerConfig.logRocketAppId && !logRocketInitialized && typeof window !== 'undefined')
  ) {
    return
  }

  // Process all buffered logs
  const logs = [...logBuffer]
  logBuffer.length = 0 // Clear the buffer

  // Disable buffering after first flush
  bufferingEnabled = false

  // Process each log entry
  for (const entry of logs) {
    await logToExternalServicesImpl(entry)
  }
}

/**
 * Send log to external services
 * @param entry Log entry
 */
async function logToExternalServices(entry: LogEntry) {
  // If services aren't fully initialized, buffer the log
  if (
    bufferingEnabled &&
    ((loggerConfig.sentryDsn && !sentryInitialized) ||
      (loggerConfig.logRocketAppId && !logRocketInitialized && typeof window !== 'undefined'))
  ) {
    bufferLogEntry(entry)
    return
  }

  await logToExternalServicesImpl(entry)
}

/**
 * Implementation of sending logs to external services
 * @param entry Log entry
 */
async function logToExternalServicesImpl(entry: LogEntry) {
  const { level, message, context, tags, originalError } = entry

  // Send to Sentry if configured and level is ERROR or FATAL
  if (
    loggerConfig.sentryDsn &&
    sentryInitialized &&
    (level === LogLevel.ERROR || level === LogLevel.FATAL) &&
    !isCircuitOpen('sentry')
  ) {
    try {
      const Sentry = await import('@sentry/nextjs')

      // Set extra context
      if (Sentry.getCurrentScope) {
        const scope = Sentry.getCurrentScope()

        // Filter context to ensure it only contains serializable values
        if (context) {
          const filteredContext = filterTagObject(context)
          if (filteredContext) {
            Object.entries(filteredContext).forEach(([key, value]) => {
              scope.setExtra(key, value)
            })
          }
        }

        // Set tags safely
        if (tags) {
          const tagObject = tagsArrayToObject(tags)
          if (tagObject) {
            Object.keys(tagObject).forEach(tag => {
              scope.setTag(tag, 'true')
            })
          }
        }
      }

      // Capture the error or message
      if (originalError) {
        // Use the original Error object for Sentry
        Sentry.captureException(originalError)
      } else {
        Sentry.captureMessage(message, level as 'debug' | 'info' | 'warning' | 'error' | 'fatal')
      }
    } catch (err) {
      console.error('Failed to log to Sentry:', err)
      recordServiceFailure('sentry')
    }
  }

  // Send to LogRocket if configured and in browser environment
  if (
    loggerConfig.logRocketAppId &&
    logRocketInitialized &&
    typeof window !== 'undefined' &&
    !isCircuitOpen('logRocket')
  ) {
    try {
      const LogRocketModule = await import('logrocket')
      const LogRocket = LogRocketModule.default

      // Log the message
      if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
        const filteredContext = filterTagObject(context)
        LogRocket.captureException(originalError || new Error(message), {
          tags: tagsArrayToObject(tags),
          extra: filteredContext,
        })
      } else if (level === LogLevel.WARN) {
        // Filter context for warn logs
        const filteredContext = filterTagObject(context)
        LogRocket.warn(message, filteredContext)
      } else {
        // Filter context for info/debug logs
        const filteredContext = filterTagObject(context)
        LogRocket.log(message, filteredContext)
      }
    } catch (err) {
      console.error('Failed to log to LogRocket:', err)
      recordServiceFailure('logRocket')
    }
  }
}

/**
 * Log a message
 * @param level Log level
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @param error Error object
 */
async function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  tags?: string[],
  error?: Error
) {
  // Skip if below minimum log level
  if (!shouldLog(level)) {
    return
  }

  // Create log entry
  const entry = createLogEntry(level, message, context, tags, error)

  // Log to console
  logToConsole(entry)

  // Log to external services
  await logToExternalServices(entry)
}

/**
 * Log a debug message
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @returns Promise that resolves when logging is complete
 */
export function debug(
  message: string,
  context?: Record<string, unknown>,
  tags?: string[]
): Promise<void> {
  return log(LogLevel.DEBUG, message, context, tags)
}

/**
 * Log an info message
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @returns Promise that resolves when logging is complete
 */
export function info(
  message: string,
  context?: Record<string, unknown>,
  tags?: string[]
): Promise<void> {
  return log(LogLevel.INFO, message, context, tags)
}

/**
 * Log a warning message
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @returns Promise that resolves when logging is complete
 */
export function warn(
  message: string,
  context?: Record<string, unknown>,
  tags?: string[]
): Promise<void> {
  return log(LogLevel.WARN, message, context, tags)
}

/**
 * Log an error message
 * @param message Log message
 * @param error Error object
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @returns Promise that resolves when logging is complete
 */
export function error(
  message: string,
  error?: Error,
  context?: Record<string, unknown>,
  tags?: string[]
): Promise<void> {
  return log(LogLevel.ERROR, message, context, tags, error)
}

/**
 * Log a fatal error message
 * @param message Log message
 * @param error Error object
 * @param context Additional context
 * @param tags Tags for categorizing logs
 * @returns Promise that resolves when logging is complete
 */
export function fatal(
  message: string,
  error?: Error,
  context?: Record<string, unknown>,
  tags?: string[]
): Promise<void> {
  return log(LogLevel.FATAL, message, context, tags, error)
}

// Logger interface type
export interface Logger {
  debug: (message: string, context?: Record<string, unknown>, tags?: string[]) => Promise<void>
  info: (message: string, context?: Record<string, unknown>, tags?: string[]) => Promise<void>
  warn: (message: string, context?: Record<string, unknown>, tags?: string[]) => Promise<void>
  error: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
    tags?: string[]
  ) => Promise<void>
  fatal: (
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
    tags?: string[]
  ) => Promise<void>
  configureLogger: (config: Partial<LoggerConfig>) => Promise<void>
  setLogUser: (userId?: string, userEmail?: string) => Promise<void>
}

// Export a default logger object
const logger: Logger = {
  debug,
  info,
  warn,
  error,
  fatal,
  configureLogger,
  setLogUser,
}

export default logger
