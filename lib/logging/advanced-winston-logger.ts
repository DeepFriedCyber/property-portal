// lib/logging/advanced-winston-logger.ts
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
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
];

/**
 * Sanitize data for logging by removing sensitive fields
 */
const sanitizeForLogging = format((info) => {
  if (info.context) {
    const sanitized = { ...info.context };
    
    // Recursively sanitize objects
    const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Check if this is a sensitive field
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } 
        // Recursively sanitize nested objects
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = sanitizeObject(value);
        } 
        // Sanitize arrays
        else if (Array.isArray(value)) {
          result[key] = value.map(item => 
            typeof item === 'object' && item !== null ? sanitizeObject(item) : item
          );
        } 
        // Pass through other values
        else {
          result[key] = value;
        }
      }
      
      return result;
    };
    
    info.context = sanitizeObject(sanitized);
  }
  
  return info;
});

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
    let contextStr = '';
    if (context) {
      contextStr = `\n${JSON.stringify(context, null, 2)}`;
    }
    
    // Include stack trace for errors if available
    const stackStr = stack ? `\n${stack}` : '';
    
    // Format the log message
    return `${timestamp} ${level}: ${message}${contextStr}${stackStr}`;
  })
);

/**
 * Format for file output
 * Includes timestamp, level, message, and metadata in JSON format
 */
const fileFormat = format.combine(
  sanitizeForLogging(),
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// Create daily rotate file transports
const combinedDailyRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat
});

const errorDailyRotateTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: fileFormat
});

/**
 * Create the Winston logger
 */
export const advancedLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'property-portal',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport with custom format
    new transports.Console({
      format: consoleFormat
    }),
    
    // Daily rotate file transports
    combinedDailyRotateTransport,
    errorDailyRotateTransport
  ],
  
  // Don't exit on handled exceptions
  exitOnError: false
});

// Add event listeners for transport errors
combinedDailyRotateTransport.on('error', (error) => {
  console.error('Error in combined log transport:', error);
});

errorDailyRotateTransport.on('error', (error) => {
  console.error('Error in error log transport:', error);
});

// Add a stream for Morgan HTTP request logging
export const logStream = {
  write: (message: string) => {
    advancedLogger.http(message.trim());
  }
};

/**
 * Add request context to log entries
 * @param req Express request object
 * @returns Logger with request context
 */
export function loggerWithRequest(req: any) {
  return {
    debug: (message: string, meta: Record<string, any> = {}) => 
      advancedLogger.debug(message, { 
        context: { 
          ...meta, 
          requestId: req.id, 
          path: req.path, 
          method: req.method 
        } 
      }),
    
    info: (message: string, meta: Record<string, any> = {}) => 
      advancedLogger.info(message, { 
        context: { 
          ...meta, 
          requestId: req.id, 
          path: req.path, 
          method: req.method 
        } 
      }),
    
    warn: (message: string, meta: Record<string, any> = {}) => 
      advancedLogger.warn(message, { 
        context: { 
          ...meta, 
          requestId: req.id, 
          path: req.path, 
          method: req.method 
        } 
      }),
    
    error: (message: string, error?: Error, meta: Record<string, any> = {}) => 
      advancedLogger.error(message, { 
        context: { 
          ...meta, 
          requestId: req.id, 
          path: req.path, 
          method: req.method 
        },
        stack: error?.stack
      }),
  };
}

// Export default logger
export default advancedLogger;