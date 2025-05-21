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

const defaultConfig: LoggerConfig = {
  enableConsole: true,
  // Set different default log levels based on environment
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  environment:
    (process.env.NODE_ENV as unknown as 'development' | 'test' | 'production') || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  sampleRate: 1.0, // Default to 100% sampling
  maxRetries: 3, // Default to 3 retry attempts
  retryDelay: 1000, // Default to 1 second base delay
}

// Global logger configuration
let loggerConfig: LoggerConfig = { ...defaultConfig }
let sentryInitialized = false
let logRocketInitialized = false

// Flag to track if we've warned about server usage
let serverWarningShown = false

/**
 * Check if code is running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * @returns Object containing device and browser details
 */
function getDeviceInfo(): Record<string, string | number | null> {
  if (!isBrowser()) {
    return { environment: 'server' }
  }
  
  try {
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      vendor: navigator.vendor,
      deviceMemory: (navigator as any).deviceMemory || null,
      connectionType: (navigator as any).connection?.effectiveType || null
    }
  } catch (error) {
    // Fallback if any browser APIs are not available
    return { 
      userAgent: navigator.userAgent,
      environment: 'browser'
    }
  }
}

/**
 * Persist critical logs to localStorage for later sending
 */
function persistLog(log: PersistentLog) {
  if (isBrowser() && typeof localStorage !== 'undefined') {
    try {
      // Load existing logs from localStorage
      const storedLogs = localStorage.getItem('persistentLogs')
      persistentLogs = storedLogs ? JSON.parse(storedLogs) : []

      // Add new log and limit to maximum number
      persistentLogs = [log, ...persistentLogs].slice(0, MAX_PERSISTENT_LOGS)

      // Save back to localStorage
      localStorage.setItem('persistentLogs', JSON.stringify(persistentLogs))
    } catch (error) {
      console.error('Failed to persist log:', error)
    }
  }
}

/**
 * Warn if logger is used in server context with client-only features
 */
function warnIfServer() {
  if (!isBrowser() && !serverWarningShown) {
    console.warn(
      'Warning: simplified-logger is being used in a server context. ' +
        'Sentry and LogRocket integrations will be disabled. ' +
        'For server-side logging, consider using a server-compatible logger.'
    )
    serverWarningShown = true
  }
}

/**
 * Send persisted logs to external services
 */
export async function sendPersistedLogs() {
  if (!isBrowser() || typeof localStorage === 'undefined') return

  try {
    // Get logs from localStorage
    const storedLogs = localStorage.getItem('persistentLogs')
    if (!storedLogs) return

    const logs: PersistentLog[] = JSON.parse(storedLogs)
    if (logs.length === 0) return

    // Attempt to send all persisted logs
    await Promise.all(
      logs.map((log: PersistentLog) =>
        logToExternalServices(
          log.level,
          log.message,
          log.context,
          undefined,
          log.error ? new Error(log.error) : undefined
        )
      )
    )

    // Clear persisted logs after successful sending
    localStorage.removeItem('persistentLogs')
    persistentLogs = []
    console.debug(`Successfully sent ${logs.length} persisted logs`)
  } catch (err) {
    console.error('Failed to send persisted logs:', err)
  }
}

/**
 * Warn if logger is used in server context with client-only features
 */
function warnIfServer() {
  if (!isBrowser() && !serverWarningShown) {
    console.warn(
      'Warning: simplified-logger is being used in a server context. ' +
        'Sentry and LogRocket integrations will be disabled. ' +
        'For server-side logging, consider using a server-compatible logger.'
    )
    serverWarningShown = true
  }
}

/**
 * Send persisted logs to external services
 */
export async function sendPersistedLogs() {
  if (!isBrowser() || typeof localStorage === 'undefined') return

  try {
    // Get logs from localStorage
    const storedLogs = localStorage.getItem('persistentLogs')
    if (!storedLogs) return

    const logs: PersistentLog[] = JSON.parse(storedLogs)
    if (logs.length === 0) return

    // Attempt to send all persisted logs
    await Promise.all(
      logs.map((log: PersistentLog) =>
        logToExternalServices(
          log.level,
          log.message,
          log.context,
          undefined,
          log.error ? new Error(log.error) : undefined
        )
      )
    )

    // Clear persisted logs after successful sending
    localStorage.removeItem('persistentLogs')
    persistentLogs = []
    console.debug(`Successfully sent ${logs.length} persisted logs`)
  } catch (err) {
    console.error('Failed to send persisted logs:', err)
  }
}

/**
 * Configure the logger
 */
export function configureLogger(config: Partial<LoggerConfig>) {
  loggerConfig = { ...loggerConfig, ...config }

  // Use environment variables for secrets if not explicitly provided
  const sentryDsn = loggerConfig.sentryDsn || process.env.NEXT_PUBLIC_SENTRY_DSN
  const logRocketAppId = loggerConfig.logRocketAppId || process.env.NEXT_PUBLIC_LOGROCKET_APP_ID

  // Initialize external logging services if configured and in browser environment
  if (sentryDsn && isBrowser()) {
    initSentry(sentryDsn, loggerConfig)
  } else if (sentryDsn) {
    warnIfServer()
  }

  if (logRocketAppId && isBrowser()) {
    initLogRocket(logRocketAppId, loggerConfig)
  } else if (logRocketAppId) {
    warnIfServer()
  }

  // In production, ensure we're not logging too verbosely
  if (process.env.NODE_ENV === 'production' && !config.minLevel) {
    loggerConfig.minLevel = LogLevel.WARN
  }

  // Set up online event listener to send persisted logs when connection is restored
  if (isBrowser() && typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    // Try to send any persisted logs on initialization
    if (navigator.onLine) {
      sendPersistedLogs()
    }

    // Add event listener for online status
    window.addEventListener('online', () => {
      console.debug('Network connection restored, attempting to send persisted logs')
      sendPersistedLogs()
    })
  }
}

/**
 * Initialize Sentry for error tracking
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
    return null
  }
}

/**
 * Initialize LogRocket for session replay
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
    const LogRocket = (await import('logrocket')).default as typeof import('logrocket').default

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

    logRocketInitialized = true
    return LogRocket
  } catch (error) {
    console.error('Failed to initialize LogRocket:', error)
    return null
  }
}

/**
 * Set user information for logging
 */
export async function setLogUser(userId?: string, userEmail?: string) {
  loggerConfig.userId = userId
  loggerConfig.userEmail = userEmail

  // Update user information in external services only in browser environment
  if (sentryInitialized && isBrowser()) {
    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.setUser({
        id: userId,
        email: userEmail,
      })
    } catch (err) {
      console.error('Failed to set user in Sentry:', err)
    }
  }

  if (logRocketInitialized && isBrowser()) {
    try {
      const LogRocket = (await import('logrocket')).default as typeof import('logrocket').default
      LogRocket.identify(userId || 'anonymous', {
        email: userEmail,
      })
    } catch (err) {
      console.error('Failed to set user in LogRocket:', err)
    }
  }
}

/**
 * Set request ID for logging
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
 * Sanitize data for logging by removing sensitive fields
 */
function sanitizeForLogging(data: any): any {
  if (!data) return data

  // Handle string values - apply pattern-based sanitization
  if (typeof data === 'string') {
    return SENSITIVE_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, '[REDACTED]'), data)
  }

  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(sanitizeForLogging)
    }

    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      // Field name check - redact based on sensitive field names
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]'
      }
      // Value pattern check for strings and recursive sanitization for other types
      else {
        sanitized[key] = sanitizeForLogging(value)
      }
    }
    return sanitized
  }

  return data
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
  
  // Skip if sampling rate not met (always process ERROR and FATAL logs)
  if (level !== LogLevel.ERROR && level !== LogLevel.FATAL && 
      loggerConfig.sampleRate !== undefined && 
      !shouldSample(loggerConfig.sampleRate)) {
    return
  }

  // Create context with user and request info
  const baseContext = {
    ...(context || {}),
    ...(loggerConfig.requestId ? { requestId: loggerConfig.requestId } : {}),
    ...(loggerConfig.userId ? { userId: loggerConfig.userId } : {})
  };
  
  // Add device information based on environment
  if (isBrowser()) {
    baseContext.device = getDeviceInfo();
  } else {
    baseContext.environment = 'server';
  }
  
  const enhancedContext = sanitizeForLogging(baseContext);

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
 * Determine if a log should be processed based on sampling rate
 * @param sampleRate Number between 0 and 1 representing percentage of logs to process
 * @returns Boolean indicating whether this particular log should be processed
 */
function shouldSample(sampleRate: number = 1.0): boolean {
  return Math.random() < sampleRate
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retries remaining
 * @returns Result of the function
 * @throws Last error encountered
 */
async function withRetries<T>(
  fn: () => Promise<T>,
  retries = loggerConfig.maxRetries || 3
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      const delay = (loggerConfig.retryDelay || 1000) * Math.pow(2, loggerConfig.maxRetries! - retries)
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetries(fn, retries - 1)
    }
    throw error
  }
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
  // Skip external logging if not in browser environment
  if (!isBrowser()) {
    return
  }

  // Persist critical errors
  if (level === LogLevel.FATAL || level === LogLevel.ERROR) {
    persistLog({
      timestamp: Date.now(),
      level,
      message,
      context: sanitizeForLogging(context),
      error: error?.toString(),
    })

    // Try to send persisted logs if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      sendPersistedLogs()
    }
  }

  // Send to Sentry if configured and level is ERROR or FATAL
  if (sentryInitialized && (level === LogLevel.ERROR || level === LogLevel.FATAL)) {
    try {
      await withRetries(async () => {
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
      })
    } catch (err) {
      console.error('Failed to log to Sentry after retries:', err)
    }
  }

  // Send to LogRocket if configured
  if (logRocketInitialized) {
    try {
      await withRetries(async () => {
        const LogRocket = (await .default;

        // Log the message
        if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
          LogRocket.captureException(error || new Error(message), {
            tags: tags?.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}),
            extra: context,
          });
        } else if (level === LogLevel.WARN) {
          LogRocket.warn(message, context);
        } else {
          LogRocket.log(message, context);
        }
      });
      });
    } catch (err) {
      console.error('Failed to log to LogRocket after retries:', err);
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
  sendPersistedLogs,
}

export default logger
