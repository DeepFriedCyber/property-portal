"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.Conflict = exports.NotFound = exports.Forbidden = exports.Unauthorized = exports.BadRequest = exports.AppError = void 0;
exports.requestIdMiddleware = requestIdMiddleware;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.createError = createError;
const winston_logger_1 = require("../logging/winston-logger");
/**
 * Custom application error class with additional context
 */
class AppError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/**
 * Generate a unique request ID
 * @returns A unique ID string
 */
function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}
/**
 * Middleware to add a unique ID to each request
 */
function requestIdMiddleware(req, res, next) {
    // Generate a unique request ID if not already present
    req.id = req.id || generateRequestId();
    // Add the request ID to response headers for debugging
    res.setHeader('X-Request-ID', req.id);
    next();
}
/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    // If headers already sent, let the default Express error handler deal with it
    if (res.headersSent) {
        return next(err);
    }
    // Handle known application errors
    if (err instanceof AppError) {
        winston_logger_1.winstonLogger.warn(`Handled error: ${err.message}`, {
            context: {
                path: req.path,
                method: req.method,
                requestId: req.id,
                details: err.details,
            },
        });
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                details: err.details,
                timestamp: new Date().toISOString(),
                requestId: req.id,
            },
        });
    }
    // Handle unexpected errors
    winston_logger_1.winstonLogger.error(`Unhandled error: ${err.message}`, {
        context: {
            stack: err.stack,
            path: req.path,
            method: req.method,
            requestId: req.id,
            body: req.body,
        },
    });
    // In production, don't expose error details to clients
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
        error: {
            message: isProduction ? 'Internal Server Error' : err.message,
            requestId: req.id,
            timestamp: new Date().toISOString(),
            // Only include stack trace in non-production environments
            ...(isProduction ? {} : { stack: err.stack }),
        },
    });
}
/**
 * Middleware to handle 404 Not Found errors
 */
function notFoundHandler(req, res) {
    winston_logger_1.winstonLogger.info(`Route not found: ${req.method} ${req.path}`, {
        context: {
            path: req.path,
            method: req.method,
            requestId: req.id,
        },
    });
    res.status(404).json({
        error: {
            message: `Route not found: ${req.method} ${req.path}`,
            requestId: req.id,
            timestamp: new Date().toISOString(),
        },
    });
}
/**
 * Helper function to create an AppError
 * @param statusCode HTTP status code
 * @param message Error message
 * @param details Additional error details
 * @returns AppError instance
 */
function createError(statusCode, message, details) {
    return new AppError(statusCode, message, details);
}
// Common error creators
const BadRequest = (message = 'Bad Request', details) => createError(400, message, details);
exports.BadRequest = BadRequest;
const Unauthorized = (message = 'Unauthorized', details) => createError(401, message, details);
exports.Unauthorized = Unauthorized;
const Forbidden = (message = 'Forbidden', details) => createError(403, message, details);
exports.Forbidden = Forbidden;
const NotFound = (message = 'Not Found', details) => createError(404, message, details);
exports.NotFound = NotFound;
const Conflict = (message = 'Conflict', details) => createError(409, message, details);
exports.Conflict = Conflict;
const InternalServerError = (message = 'Internal Server Error', details) => createError(500, message, details);
exports.InternalServerError = InternalServerError;
