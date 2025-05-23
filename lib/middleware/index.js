"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMiddleware = setupMiddleware;
// lib/middleware/index.ts
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const winston_logger_1 = require("../logging/winston-logger");
const errorHandler_1 = require("./errorHandler");
/**
 * Configure all middleware for the Express application
 * @param app Express application instance
 */
function setupMiddleware(app) {
    // Request ID middleware (should be first to ensure all logs have request ID)
    app.use(errorHandler_1.requestIdMiddleware);
    // Security middleware
    app.use((0, helmet_1.default)());
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Request-ID'],
        credentials: true,
    }));
    // Body parsers
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
    // Compression
    app.use((0, compression_1.default)());
    // Request logging middleware
    app.use((req, res, next) => {
        // Log at the start of the request
        const startTime = Date.now();
        winston_logger_1.winstonLogger.info(`Request started: ${req.method} ${req.path}`, {
            context: {
                method: req.method,
                path: req.path,
                query: req.query,
                requestId: req.id,
                userAgent: req.headers['user-agent'],
                ip: req.ip,
            },
        });
        // Log when the response is finished
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const level = res.statusCode >= 400 ? 'warn' : 'info';
            winston_logger_1.winstonLogger[level](`Request completed: ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
                context: {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    duration,
                    requestId: req.id,
                },
            });
        });
        next();
    });
    // Note: Route handlers would be added here in the actual application
    // 404 handler - should be after all routes
    app.use(errorHandler_1.notFoundHandler);
    // Error handler - should be the last middleware
    app.use(errorHandler_1.errorHandler);
}
// Export all error handling utilities
__exportStar(require("./errorHandler"), exports);
