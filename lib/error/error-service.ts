// lib/error/error-service.ts
import { ApiError } from '@/lib/api/error-handling'

import { ValidationError } from '@/lib/api/validation'
import logger from '@/lib/logging/logger'

/**
 * Error types for categorization
 */
export enum ErrorType {
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error context interface
 */
export interface ErrorContext {
  type?: ErrorType
  severity?: ErrorSeverity
  userId?: string
  requestId?: string
  url?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
  tags?: string[]
}

/**
 * Centralized error service for handling errors consistently across the application
 */
export class ErrorService {
  private static instance: ErrorService
  private errorHandlers: Array<(error: Error, context?: ErrorContext) => void> = []

  /**
   * Get the singleton instance of the error service
   */
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize default error handlers
    this.registerErrorHandler(this.logError)
  }

  /**
   * Register an error handler
   * @param handler Error handler function
   */
  public registerErrorHandler(handler: (error: Error, context?: ErrorContext) => void): void {
    this.errorHandlers.push(handler)
  }

  /**
   * Handle an error
   * @param error Error to handle
   * @param context Error context
   */
  public handleError(error: Error, context?: ErrorContext): void {
    // Determine error type if not provided
    const errorType = context?.type || this.determineErrorType(error)

    // Determine error severity if not provided
    const errorSeverity = context?.severity || this.determineErrorSeverity(error, errorType)

    // Create complete context
    const completeContext: ErrorContext = {
      ...context,
      type: errorType,
      severity: errorSeverity,
    }

    // Execute all registered error handlers
    for (const handler of this.errorHandlers) {
      try {
        handler(error, completeContext)
      } catch (handlerError) {
        // If an error handler throws, log it but continue with other handlers
        console.error('Error in error handler:', handlerError)
      }
    }
  }

  /**
   * Create an error handler function for use in components
   * @param defaultContext Default context to include with all errors
   * @returns Error handler function
   */
  public createErrorHandler(defaultContext?: ErrorContext) {
    return (error: Error, additionalContext?: ErrorContext) => {
      this.handleError(error, {
        ...defaultContext,
        ...additionalContext,
      })
    }
  }

  /**
   * Create a try/catch wrapper for a function
   * @param fn Function to wrap
   * @param context Error context
   * @returns Wrapped function
   */
  public withErrorHandling<T extends Array<unknown>, R>(
    fn: (...args: T) => R,
    context?: ErrorContext
  ): (...args: T) => R | undefined {
    return (...args: T): R | undefined => {
      try {
        return fn(...args)
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), context)
        return undefined
      }
    }
  }

  /**
   * Create a try/catch wrapper for an async function
   * @param fn Async function to wrap
   * @param context Error context
   * @returns Wrapped async function
   */
  public withAsyncErrorHandling<T extends Array<unknown>, R>(
    fn: (...args: T) => Promise<R>,
    context?: ErrorContext
  ): (...args: T) => Promise<R | undefined> {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), context)
        return undefined
      }
    }
  }

  /**
   * Default error handler that logs errors
   * @param error Error to log
   * @param context Error context
   */
  private logError(error: Error, context?: ErrorContext): void {
    const { type, severity, userId, requestId, url, component, action, metadata, tags } =
      context || {}

    // Create log context
    const logContext: Record<string, unknown> = {
      errorType: type,
      errorSeverity: severity,
      errorName: error.name,
      errorMessage: error.message,
      userId,
      requestId,
      url,
      component,
      action,
    }

    // Add metadata if available
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        logContext[key] = value
      })
    }

    // Create log tags
    const logTags = ['error', type || 'unknown']
    if (tags) {
      logTags.push(...tags)
    }

    // Log with appropriate level based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        logger.fatal('Critical error occurred', error, logContext, logTags)
        break
      case ErrorSeverity.HIGH:
        logger.error('Serious error occurred', error, logContext, logTags)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn('Error occurred', error, logContext, logTags)
        break
      case ErrorSeverity.LOW:
      default:
        logger.info('Minor error occurred', error, logContext, logTags)
        break
    }
  }

  /**
   * Determine the type of an error
   * @param error Error to analyze
   * @returns Error type
   */
  private determineErrorType(error: Error): ErrorType {
    if (error instanceof ApiError) {
      return ErrorType.API
    } else if (error instanceof ValidationError) {
      return ErrorType.VALIDATION
    } else if (error.name === 'DatabaseError' || error.message.includes('database')) {
      return ErrorType.DATABASE
    } else if (
      error.name === 'AuthenticationError' ||
      error.message.toLowerCase().includes('authentication') ||
      error.message.toLowerCase().includes('unauthenticated')
    ) {
      return ErrorType.AUTHENTICATION
    } else if (
      error.name === 'AuthorizationError' ||
      error.message.toLowerCase().includes('authorization') ||
      error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('forbidden')
    ) {
      return ErrorType.AUTHORIZATION
    } else if (
      error.name === 'NetworkError' ||
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('connection')
    ) {
      return ErrorType.NETWORK
    } else if (
      error.name === 'ExternalServiceError' ||
      error.message.toLowerCase().includes('external') ||
      error.message.toLowerCase().includes('service')
    ) {
      return ErrorType.EXTERNAL
    }

    return ErrorType.UNKNOWN
  }

  /**
   * Determine the severity of an error
   * @param error Error to analyze
   * @param type Error type
   * @returns Error severity
   */
  private determineErrorSeverity(error: Error, type: ErrorType): ErrorSeverity {
    // Critical errors
    if (
      type === ErrorType.DATABASE ||
      (type === ErrorType.API && error instanceof ApiError && error.status >= 500) ||
      error.message.toLowerCase().includes('critical') ||
      error.message.toLowerCase().includes('fatal')
    ) {
      return ErrorSeverity.CRITICAL
    }

    // High severity errors
    if (
      type === ErrorType.AUTHENTICATION ||
      type === ErrorType.AUTHORIZATION ||
      (type === ErrorType.API &&
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500) ||
      error.message.toLowerCase().includes('security') ||
      error.message.toLowerCase().includes('breach')
    ) {
      return ErrorSeverity.HIGH
    }

    // Medium severity errors
    if (
      type === ErrorType.VALIDATION ||
      type === ErrorType.NETWORK ||
      type === ErrorType.EXTERNAL
    ) {
      return ErrorSeverity.MEDIUM
    }

    // Default to low severity
    return ErrorSeverity.LOW
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance()

/**
 * Create a React error handler hook
 * @param defaultContext Default context to include with all errors
 * @returns Error handler function
 */
export function createErrorHandler(defaultContext?: ErrorContext) {
  return errorService.createErrorHandler(defaultContext)
}

/**
 * Create a try/catch wrapper for a function
 * @param fn Function to wrap
 * @param context Error context
 * @returns Wrapped function
 */
export function withErrorHandling<T extends Array<unknown>, R>(
  fn: (...args: T) => R,
  context?: ErrorContext
): (...args: T) => R | undefined {
  return errorService.withErrorHandling(fn, context)
}

/**
 * Create a try/catch wrapper for an async function
 * @param fn Async function to wrap
 * @param context Error context
 * @returns Wrapped async function
 */
export function withAsyncErrorHandling<T extends Array<unknown>, R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
): (...args: T) => Promise<R | undefined> {
  return errorService.withAsyncErrorHandling(fn, context)
}

/**
 * Handle an error
 * @param error Error to handle
 * @param context Error context
 */
export function handleError(error: Error, context?: ErrorContext): void {
  errorService.handleError(error, context)
}

// Export default object for convenience
export default {
  handleError,
  createErrorHandler,
  withErrorHandling,
  withAsyncErrorHandling,
  ErrorType,
  ErrorSeverity,
}
