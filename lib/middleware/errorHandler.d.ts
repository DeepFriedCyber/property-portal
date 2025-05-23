import { NextFunction, Request, Response } from 'express';
/**
 * Custom application error class with additional context
 */
export declare class AppError extends Error {
    statusCode: number;
    details?: Record<string, unknown> | undefined;
    constructor(statusCode: number, message: string, details?: Record<string, unknown> | undefined);
}
/**
 * Middleware to add a unique ID to each request
 */
export declare function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void;
/**
 * Global error handler middleware
 */
export declare function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
/**
 * Middleware to handle 404 Not Found errors
 */
export declare function notFoundHandler(req: Request, res: Response): void;
/**
 * Helper function to create an AppError
 * @param statusCode HTTP status code
 * @param message Error message
 * @param details Additional error details
 * @returns AppError instance
 */
export declare function createError(statusCode: number, message: string, details?: Record<string, unknown>): AppError;
export declare const BadRequest: (message?: string, details?: Record<string, unknown>) => AppError;
export declare const Unauthorized: (message?: string, details?: Record<string, unknown>) => AppError;
export declare const Forbidden: (message?: string, details?: Record<string, unknown>) => AppError;
export declare const NotFound: (message?: string, details?: Record<string, unknown>) => AppError;
export declare const Conflict: (message?: string, details?: Record<string, unknown>) => AppError;
export declare const InternalServerError: (message?: string, details?: Record<string, unknown>) => AppError;
//# sourceMappingURL=errorHandler.d.ts.map