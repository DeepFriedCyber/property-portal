"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonLogger = void 0;
exports.loggerWithRequest = loggerWithRequest;
// lib/logging/winston-logger.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
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
const sanitizeForLogging = (0, winston_1.format)(info => {
    if (info.context) {
        const sanitized = { ...info.context };
        // Recursively sanitize objects
        const sanitizeObject = (obj) => {
            const result = {};
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
                    result[key] = value.map(item => typeof item === 'object' && item !== null ? sanitizeObject(item) : item);
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
const consoleFormat = winston_1.format.combine(sanitizeForLogging(), winston_1.format.colorize(), winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.printf(({ level, message, timestamp, context, stack }) => {
    // Format the context
    let contextStr = '';
    if (context) {
        contextStr = `\n${JSON.stringify(context, null, 2)}`;
    }
    // Include stack trace for errors if available
    const stackStr = stack ? `\n${stack}` : '';
    // Format the log message
    return `${timestamp} ${level}: ${message}${contextStr}${stackStr}`;
}));
/**
 * Format for file output
 * Includes timestamp, level, message, and metadata in JSON format
 */
const fileFormat = winston_1.format.combine(sanitizeForLogging(), winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json());
/**
 * Create the Winston logger
 */
exports.winstonLogger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: {
        service: 'property-portal',
        environment: process.env.NODE_ENV || 'development',
    },
    transports: [
        // Console transport with custom format
        new winston_1.transports.Console({
            format: consoleFormat,
        }),
        // Error log file
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
            tailable: true,
        }),
        // Combined log file (all levels)
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'combined.log'),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
            tailable: true,
        }),
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'rejections.log'),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston_1.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log'),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
    ],
    // Don't exit on handled exceptions
    exitOnError: false,
});
/**
 * Add request context to log entries
 * @param req Express request object
 * @returns Logger with request context
 */
function loggerWithRequest(req) {
    return {
        debug: (message, meta = {}) => exports.winstonLogger.debug(message, {
            context: {
                ...meta,
                requestId: req.id,
                path: req.path,
                method: req.method,
            },
        }),
        info: (message, meta = {}) => exports.winstonLogger.info(message, {
            context: {
                ...meta,
                requestId: req.id,
                path: req.path,
                method: req.method,
            },
        }),
        warn: (message, meta = {}) => exports.winstonLogger.warn(message, {
            context: {
                ...meta,
                requestId: req.id,
                path: req.path,
                method: req.method,
            },
        }),
        error: (message, error, meta = {}) => exports.winstonLogger.error(message, {
            context: {
                ...meta,
                requestId: req.id,
                path: req.path,
                method: req.method,
            },
            stack: error?.stack,
        }),
    };
}
// Export default logger
exports.default = exports.winstonLogger;
