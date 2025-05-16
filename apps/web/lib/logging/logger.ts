// lib/logging/logger.ts
/**
 * Structured logging utility for the application
 *
 * This module provides a consistent interface for logging across the application.
 * It supports different log levels, structured metadata, and can be configured
 * to send logs to external services like Sentry or LogRocket.
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  tags?: string[];
  error?: Error;
}

// Logger configuration interface
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  sentryDsn?: string;
  logRocketAppId?: string;
  environment: 'development' | 'test' | 'production';
  release?: string;
  userId?: string;
  userEmail?: string;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  environment: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,
};

// Global logger configuration
let loggerConfig: LoggerConfig = { ...defaultConfig };

// External logging services
let sentryInitialized = false;
let logRocketInitialized = false;

/**
 * Initialize Sentry for error tracking
 * This is done lazily to avoid importing Sentry in environments where it's not needed
 */
async function initSentry(dsn: string, config: LoggerConfig) {
  if (sentryInitialized) return;

  try {
    // Dynamically import Sentry to avoid bundling it unnecessarily
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.environment === 'production' ? 0.2 : 1.0,
      // Only send errors and above to Sentry
      beforeSend(event) {
        if (event.level && ['error', 'fatal'].includes(event.level)) {
          return event;
        }
        return null;
      },
    });

    // Set user information if available
    if (config.userId || config.userEmail) {
      Sentry.setUser({
        id: config.userId,
        email: config.userEmail,
      });
    }

    sentryInitialized = true;

    return Sentry;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
    return null;
  }
}

/**
 * Initialize LogRocket for session replay
 * This is done lazily to avoid importing LogRocket in environments where it's not needed
 */
async function initLogRocket(appId: string, config: LoggerConfig) {
  if (logRocketInitialized) return;

  try {
    // Dynamically import LogRocket to avoid bundling it unnecessarily
    // @ts-ignore - LogRocket types may vary
    const LogRocket = (await import('logrocket')).default;

    LogRocket.init(appId, {
      release: config.release,
      console: {
        isEnabled: {
          // Configure which console methods to capture
          log: true,
          warn: true,
          error: true,
        },
      },
      network: {
        isEnabled: true,
        requestSanitizer: (request) => {
          // Don't log request bodies for sensitive endpoints
          if (
            request.url &&
            (request.url.includes('/api/auth') || request.url.includes('/api/user'))
          ) {
            request.body = undefined;
          }
          return request;
        },
        responseSanitizer: (response) => {
          // Don't log response bodies for sensitive endpoints
          if (
            response.url &&
            (response.url.includes('/api/auth') || response.url.includes('/api/user'))
          ) {
            response.body = undefined;
          }
          return response;
        },
      },
    });

    // Set user information if available
    if (config.userId || config.userEmail) {
      LogRocket.identify(config.userId || 'anonymous', {
        email: config.userEmail || '',
      });
    }

    // Connect LogRocket with Sentry if both are enabled
    if (sentryInitialized) {
      const Sentry = await import('@sentry/nextjs');
      LogRocket.getSessionURL((sessionURL) => {
        // Use a try-catch to handle potential missing methods
        try {
          // @ts-ignore - Sentry API might vary between versions
          Sentry.withScope((scope: any) => {
            scope.setExtra('logRocketSessionURL', sessionURL);
          });
        } catch (err) {
          console.error('Failed to set LogRocket session URL in Sentry:', err);
        }
      });
    }

    logRocketInitialized = true;

    return LogRocket;
  } catch (error) {
    console.error('Failed to initialize LogRocket:', error);
    return null;
  }
}

/**
 * Configure the logger
 * @param config Logger configuration
 */
export function configureLogger(config: Partial<LoggerConfig>) {
  loggerConfig = { ...loggerConfig, ...config };

  // Initialize external logging services if configured
  if (loggerConfig.sentryDsn && typeof window !== 'undefined') {
    initSentry(loggerConfig.sentryDsn, loggerConfig);
  }

  if (loggerConfig.logRocketAppId && typeof window !== 'undefined') {
    initLogRocket(loggerConfig.logRocketAppId, loggerConfig);
  }
}

/**
 * Set user information for logging
 * @param userId User ID
 * @param userEmail User email
 */
export async function setLogUser(userId?: string, userEmail?: string) {
  loggerConfig.userId = userId;
  loggerConfig.userEmail = userEmail;

  // Update user information in external services
  if (sentryInitialized) {
    const Sentry = await import('@sentry/nextjs');
    if (Sentry.setUser) {
      Sentry.setUser({
        id: userId,
        email: userEmail,
      });
    }
  }

  if (logRocketInitialized && typeof window !== 'undefined') {
    // @ts-ignore - LogRocket types may vary
    const LogRocket = (await import('logrocket')).default;
    LogRocket.identify(userId || 'anonymous', {
      email: userEmail || '',
    });
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
  context?: Record<string, any>,
  tags?: string[],
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    tags,
    error,
  };
}

/**
 * Log to the console with appropriate formatting
 * @param entry Log entry
 */
function logToConsole(entry: LogEntry) {
  if (!loggerConfig.enableConsole) return;

  const { level, message, timestamp, context, tags, error } = entry;

  // Format the log message
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  // Log with appropriate console method
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, { context, tags });
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, { context, tags });
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, { context, tags });
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formattedMessage, { context, tags, error });
      break;
  }
}

/**
 * Send log to external services
 * @param entry Log entry
 */
async function logToExternalServices(entry: LogEntry) {
  const { level, message, context, tags, error } = entry;

  // Send to Sentry if configured and level is ERROR or FATAL
  if (
    loggerConfig.sentryDsn &&
    sentryInitialized &&
    (level === LogLevel.ERROR || level === LogLevel.FATAL)
  ) {
    try {
      const Sentry = await import('@sentry/nextjs');

      // Set extra context
      try {
        // @ts-ignore - Sentry API might vary between versions
        Sentry.withScope((scope: any) => {
          if (context) {
            Object.entries(context).forEach(([key, value]) => {
              scope.setExtra(key, value);
            });
          }

          if (tags) {
            tags.forEach((tag) => {
              scope.setTag(tag, 'true');
            });
          }
        });
      } catch (err) {
        console.error('Failed to set context in Sentry:', err);
      }

      // Capture the error or message
      if (error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(message, level as any);
      }
    } catch (err) {
      console.error('Failed to log to Sentry:', err);
    }
  }

  // Send to LogRocket if configured
  if (loggerConfig.logRocketAppId && logRocketInitialized) {
    try {
      // @ts-ignore - LogRocket types may vary
      const LogRocket = (await import('logrocket')).default;

      // Log the message
      if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
        LogRocket.captureException(error || new Error(message), {
          tags,
          extra: context,
        });
      } else if (level === LogLevel.WARN) {
        LogRocket.warn(message, context);
      } else {
        LogRocket.log(message, context);
      }
    } catch (err) {
      console.error('Failed to log to LogRocket:', err);
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
  context?: Record<string, any>,
  tags?: string[],
  error?: Error
) {
  // Skip if below minimum log level
  if (
    (level === LogLevel.DEBUG && loggerConfig.minLevel !== LogLevel.DEBUG) ||
    (level === LogLevel.INFO &&
      [LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL].includes(loggerConfig.minLevel)) ||
    (level === LogLevel.WARN && [LogLevel.ERROR, LogLevel.FATAL].includes(loggerConfig.minLevel)) ||
    (level === LogLevel.ERROR && loggerConfig.minLevel === LogLevel.FATAL)
  ) {
    return;
  }

  // Create log entry
  const entry = createLogEntry(level, message, context, tags, error);

  // Log to console
  logToConsole(entry);

  // Log to external services
  await logToExternalServices(entry);
}

/**
 * Log a debug message
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 */
export function debug(message: string, context?: Record<string, any>, tags?: string[]) {
  log(LogLevel.DEBUG, message, context, tags);
}

/**
 * Log an info message
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 */
export function info(message: string, context?: Record<string, any>, tags?: string[]) {
  log(LogLevel.INFO, message, context, tags);
}

/**
 * Log a warning message
 * @param message Log message
 * @param context Additional context
 * @param tags Tags for categorizing logs
 */
export function warn(message: string, context?: Record<string, any>, tags?: string[]) {
  log(LogLevel.WARN, message, context, tags);
}

/**
 * Log an error message
 * @param message Log message
 * @param error Error object
 * @param context Additional context
 * @param tags Tags for categorizing logs
 */
export function error(
  message: string,
  error?: Error,
  context?: Record<string, any>,
  tags?: string[]
) {
  log(LogLevel.ERROR, message, context, tags, error);
}

/**
 * Log a fatal error message
 * @param message Log message
 * @param error Error object
 * @param context Additional context
 * @param tags Tags for categorizing logs
 */
export function fatal(
  message: string,
  error?: Error,
  context?: Record<string, any>,
  tags?: string[]
) {
  log(LogLevel.FATAL, message, context, tags, error);
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
};

export default logger;
