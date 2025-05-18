// lib/logging/simplified-logger.ts

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

interface LoggerConfig {
  enableConsole?: boolean
  minLevel?: LogLevel
  sentryDsn?: string
  logRocketAppId?: string
  userId?: string
  userEmail?: string
  requestId?: string
  release?: string
  environment?: 'development' | 'test' | 'production'
}

/**
 * Sanitize an object to remove sensitive data before logging
 * @param obj The object to sanitize
 * @returns A sanitized copy of the object
 */
function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item))
  }

  // Handle objects
  const sanitized = { ...obj }
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase()

    // Check if this key contains any sensitive terms
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeForLogging(sanitized[key])
    }
  }

  return sanitized
}

const defaultConfig: LoggerConfig = {
  enableConsole: true,
  // Set different default log levels based on environment
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  environment:
    (process.env.NODE_ENV as unknown as 'development' | 'test' | 'production') || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,
}

// Global logger configuration
// TODO: Consider refactoring to use a class or singleton pattern if this module grows more complex
// This would help encapsulate state and provide better testability
let loggerConfig: LoggerConfig = { ...defaultConfig }
let sentryInitialized = false
let logRocketInitialized = false

/**
 * Configure the logger
 */
export function configureLogger(config: Partial<LoggerConfig>) {
  loggerConfig = { ...loggerConfig, ...config }

  // Use environment variables for secrets if not explicitly provided
  const sentryDsn = loggerConfig.sentryDsn || process.env.NEXT_PUBLIC_SENTRY_DSN
  const logRocketAppId = loggerConfig.logRocketAppId || process.env.NEXT_PUBLIC_LOGROCKET_APP_ID

  // Initialize external logging services if configured
  if (sentryDsn && typeof window !== 'undefined') {
    initSentry(sentryDsn, loggerConfig)
  }

  if (logRocketAppId && typeof window !== 'undefined') {
    initLogRocket(logRocketAppId, loggerConfig)
  }

  // In production, ensure we're not logging too verbosely
  if (process.env.NODE_ENV === 'production' && !config.minLevel) {
    loggerConfig.minLevel = LogLevel.WARN
  }
}

/**
 * Initialize Sentry for error tracking
 * @returns The Sentry instance if initialization was successful, null otherwise
 */
async function initSentry(dsn: string, config: LoggerConfig) {
  // Skip initialization if already initialized or if dsn is missing/empty
  if (sentryInitialized) {
    console.debug('Sentry already initialized, skipping initialization')
    return
  }

  if (!dsn || dsn.trim() === '') {
    console.warn('Sentry DSN is empty or missing, skipping initialization')
    return null
  }

  try {
    const Sentry = await import('@sentry/nextjs')

    Sentry.init({
      dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.environment === 'production' ? 0.2 : 1.0,
    })

    // Set user information if available
    if (config.userId || config.userEmail) {
      Sentry.setUser({
        id: config.userId,
        email: config.userEmail,
      })
    }

    sentryInitialized = true
    return Sentry
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
    // Log detailed error information to help with debugging
    if (error instanceof Error) {
      console.error(`Sentry initialization error: ${error.name}: ${error.message}`)
      if (error.stack) console.error(`Stack trace: ${error.stack}`)
    }
    // Log environment information to help diagnose deployment issues
    console.error(`Environment: ${process.env.NODE_ENV}, Release: ${config.release}`)
    return null
  }
}

/**
 * Initialize LogRocket for session replay
 * @returns The LogRocket instance if initialization was successful, null otherwise
 */
async function initLogRocket(appId: string, config: LoggerConfig) {
  // Skip initialization if already initialized or if appId is missing/empty
  if (logRocketInitialized) {
    console.debug('LogRocket already initialized, skipping initialization')
    return
  }

  if (!appId || appId.trim() === '') {
    console.warn('LogRocket App ID is empty or missing, skipping initialization')
    return null
  }

  try {
    const LogRocket = (await import('logrocket')).default

    LogRocket.init(appId, {
      release: config.release,
      console: {
        isEnabled: {
          error: true,
          warn: true,
        },
      },
      network: {
        isEnabled: true,
        requestSanitizer: request => {
          // Don't log request bodies for sensitive endpoints
          if (request.url.includes('/api/auth') || request.url.includes('/api/user')) {
            request.body = null
          }
          return request
        },
        responseSanitizer: response => {
          // Don't log response bodies for sensitive endpoints
          if (response.url.includes('/api/auth') || response.url.includes('/api/user')) {
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
        Sentry.configureScope(scope => {
          scope.setExtra('logRocketSessionURL', sessionURL)

          // Add request ID to Sentry scope if available
          if (loggerConfig.requestId) {
            scope.setTag('requestId', loggerConfig.requestId)
          }
        })
      })
    }

    // Add request ID to LogRocket metadata if available
    if (loggerConfig.requestId) {
      LogRocket.setMeta('requestId', loggerConfig.requestId)
    }

    logRocketInitialized = true
    return LogRocket
  } catch (error) {
    console.error('Failed to initialize LogRocket:', error)
    // Log detailed error information to help with debugging
    if (error instanceof Error) {
      console.error(`LogRocket initialization error: ${error.name}: ${error.message}`)
      if (error.stack) console.error(`Stack trace: ${error.stack}`)
    }
    // Log environment information to help diagnose deployment issues
    console.error(
      `Environment: ${process.env.NODE_ENV}, Release: ${config.release}, AppId: ${appId}`
    )
    return null
  }
}

/**
 * Set user information for logging
 */
export async function setLogUser(userId?: string, userEmail?: string) {
  loggerConfig.userId = userId
  loggerConfig.userEmail = userEmail

  // Update user information in external services
  if (sentryInitialized) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.setUser({
      id: userId,
      email: userEmail,
    })
  }

  if (logRocketInitialized && typeof window !== 'undefined') {
    const LogRocket = (await import('logrocket')).default
    LogRocket.identify(userId || 'anonymous', {
      email: userEmail,
    })
  }
}

/**
 * Set request ID for logging
 * This is useful for tracking logs across a single request lifecycle
 * and correlating logs between different services
 */
export async function setRequestId(requestId: string) {
  loggerConfig.requestId = requestId

  // Update request ID in external services
  if (sentryInitialized && typeof window !== 'undefined') {
    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.configureScope(scope => {
        scope.setTag('requestId', requestId)
      })
    } catch (err) {
      console.error('Failed to set request ID in Sentry:', err)
    }
  }

  if (logRocketInitialized && typeof window !== 'undefined') {
    try {
      const LogRocket = (await import('logrocket')).default
      LogRocket.setMeta('requestId', requestId)
    } catch (err) {
      console.error('Failed to set request ID in LogRocket:', err)
    }
  }
}

/**
 * Log a message with the specified level
 */
async function log(
  level: LogLevel,
  message: string,
  context?: any,
  tags?: string[],
  error?: Error
) {
  // Skip if below minimum log level
  if (loggerConfig.minLevel && shouldSkipLog(level, loggerConfig.minLevel)) {
    return
  }

  // Enhance context with requestId and userId if available in config
  const enhancedContext = sanitizeForLogging({
    ...(context || {}),
    ...(loggerConfig.requestId ? { requestId: loggerConfig.requestId } : {}),
    ...(loggerConfig.userId ? { userId: loggerConfig.userId } : {}),
  })

  // Log to console if enabled
  if (loggerConfig.enableConsole !== false) {
    logToConsole(level, message, enhancedContext, tags, error)
  }

  // Log to external services
  await logToExternalServices(level, message, enhancedContext, tags, error)
}

/**
 * Determine if a log should be skipped based on minimum level
 */
function shouldSkipLog(level: LogLevel, minLevel: LogLevel): boolean {
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
  const levelIndex = levels.indexOf(level)
  const minLevelIndex = levels.indexOf(minLevel)

  return levelIndex < minLevelIndex
}

/**
 * Log to the console with appropriate formatting
 */
function logToConsole(
  level: LogLevel,
  message: string,
  context?: any,
  tags?: string[],
  error?: Error
) {
  const timestamp = new Date().toISOString()
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  const logData = { ...(context || {}), tags }

  // Use the appropriate console method based on level
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, logData)
      break
    case LogLevel.INFO:
      console.info(formattedMessage, logData)
      break
    case LogLevel.WARN:
      console.warn(formattedMessage, logData)
      break
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formattedMessage, error || '', logData)
      break
  }
}

/**
 * Log to external services like Sentry and LogRocket
 */
async function logToExternalServices(
  level: LogLevel,
  message: string,
  context?: any,
  tags?: string[],
  error?: Error
) {
  // Send to Sentry if configured and level is ERROR or FATAL
  if (sentryInitialized && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
    try {
      const Sentry = await import('@sentry/nextjs')

      // Set extra context
      Sentry.configureScope(scope => {
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value)
          })
        }

        if (tags) {
          tags.forEach(tag => {
            scope.setTag(tag, 'true')
          })
        }
      })

      // Capture the error or message
      if (error) {
        Sentry.captureException(error)
      } else {
        Sentry.captureMessage(message, level)
      }
    } catch (err) {
      console.error('Failed to log to Sentry:', err)
      if (err instanceof Error) {
        console.error(`Sentry logging error: ${err.name}: ${err.message}`)
        // Don't log stack trace here to avoid recursive error logging
      }
    }
  }

  // Send to LogRocket if configured
  if (logRocketInitialized) {
    try {
      const LogRocket = (await import('logrocket')).default

      // Log the message
      if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
        LogRocket.captureException(error || new Error(message), {
          tags: tags?.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}),
          extra: context,
        })
      } else if (level === LogLevel.WARN) {
        LogRocket.warn(message, context)
      } else {
        LogRocket.log(message, context)
      }
    } catch (err) {
      console.error('Failed to log to LogRocket:', err)
      if (err instanceof Error) {
        console.error(`LogRocket logging error: ${err.name}: ${err.message}`)
        // Don't log stack trace here to avoid recursive error logging
      }
    }
  }
}

/**
 * Log a debug message
 */
export function debug(message: string, context?: any, tags?: string[]) {
  log(LogLevel.DEBUG, message, context, tags)
}

/**
 * Log an info message
 */
export function info(message: string, context?: any, tags?: string[]) {
  log(LogLevel.INFO, message, context, tags)
}

/**
 * Log a warning message
 */
export function warn(message: string, context?: any, tags?: string[]) {
  log(LogLevel.WARN, message, context, tags)
}

/**
 * Log an error message
 */
export function error(message: string, errorObj?: Error, context?: any, tags?: string[]) {
  log(LogLevel.ERROR, message, context, tags, errorObj)
}

/**
 * Log a fatal error message
 */
export function fatal(message: string, errorObj?: Error, context?: any, tags?: string[]) {
  log(LogLevel.FATAL, message, context, tags, errorObj)
}

// Export a default logger object
const logger = {
  debug,
  info,
  warn,
  error,
  fatal,
  configureLogger,
  setLogUser,
  setRequestId,
}

export default logger
