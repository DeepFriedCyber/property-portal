// lib/error/error-service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { ApiError } from '@/lib/api/error-handling'

import {
  errorService,
  ErrorType,
  ErrorSeverity,
  handleError,
  withErrorHandling,
  withAsyncErrorHandling,
} from './error-service'

import { ValidationError } from '@/lib/api/validation'
import logger from '@/lib/logging/logger'

// Mock the logger
vi.mock('@/lib/logging/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}))

describe('ErrorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('handleError', () => {
    it('should log errors with the appropriate severity', () => {
      // Test low severity error
      const lowError = new Error('Low severity error')
      handleError(lowError, { severity: ErrorSeverity.LOW })
      expect(logger.info).toHaveBeenCalledWith(
        'Minor error occurred',
        lowError,
        expect.objectContaining({ errorSeverity: ErrorSeverity.LOW }),
        expect.arrayContaining(['error'])
      )

      // Test medium severity error
      const mediumError = new Error('Medium severity error')
      handleError(mediumError, { severity: ErrorSeverity.MEDIUM })
      expect(logger.warn).toHaveBeenCalledWith(
        'Error occurred',
        mediumError,
        expect.objectContaining({ errorSeverity: ErrorSeverity.MEDIUM }),
        expect.arrayContaining(['error'])
      )

      // Test high severity error
      const highError = new Error('High severity error')
      handleError(highError, { severity: ErrorSeverity.HIGH })
      expect(logger.error).toHaveBeenCalledWith(
        'Serious error occurred',
        highError,
        expect.objectContaining({ errorSeverity: ErrorSeverity.HIGH }),
        expect.arrayContaining(['error'])
      )

      // Test critical severity error
      const criticalError = new Error('Critical severity error')
      handleError(criticalError, { severity: ErrorSeverity.CRITICAL })
      expect(logger.fatal).toHaveBeenCalledWith(
        'Critical error occurred',
        criticalError,
        expect.objectContaining({ errorSeverity: ErrorSeverity.CRITICAL }),
        expect.arrayContaining(['error'])
      )
    })

    it('should determine error type correctly', () => {
      // Test API error
      const apiError = new ApiError('API error', 500, 'API_ERROR')
      handleError(apiError)
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        apiError,
        expect.objectContaining({ errorType: ErrorType.API }),
        expect.arrayContaining(['error', ErrorType.API])
      )

      // Test validation error
      const validationError = new ValidationError('Validation error', 'VALIDATION_ERROR')
      handleError(validationError)
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        validationError,
        expect.objectContaining({ errorType: ErrorType.VALIDATION }),
        expect.arrayContaining(['error', ErrorType.VALIDATION])
      )

      // Test database error
      const dbError = new Error('Database connection failed')
      handleError(dbError)
      expect(logger.fatal).toHaveBeenCalledWith(
        expect.any(String),
        dbError,
        expect.objectContaining({ errorType: ErrorType.DATABASE }),
        expect.arrayContaining(['error', ErrorType.DATABASE])
      )

      // Test authentication error
      const authError = new Error('Authentication failed')
      handleError(authError)
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        authError,
        expect.objectContaining({ errorType: ErrorType.AUTHENTICATION }),
        expect.arrayContaining(['error', ErrorType.AUTHENTICATION])
      )
    })

    it('should include additional context in logs', () => {
      const error = new Error('Test error')
      const context = {
        userId: 'user123',
        requestId: 'req456',
        component: 'TestComponent',
        action: 'testAction',
        metadata: { test: 'value' },
        tags: ['test-tag'],
      }

      handleError(error, context)

      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({
          userId: 'user123',
          requestId: 'req456',
          component: 'TestComponent',
          action: 'testAction',
          test: 'value',
        }),
        expect.arrayContaining(['error', 'unknown', 'test-tag'])
      )
    })
  })

  describe('withErrorHandling', () => {
    it('should return the result of the function if no error occurs', () => {
      const fn = () => 'success'
      const safeFn = withErrorHandling(fn)

      expect(safeFn()).toBe('success')
      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should handle errors thrown by the function', () => {
      const error = new Error('Test error')
      const fn = () => {
        throw error
      }
      const safeFn = withErrorHandling(fn)

      expect(safeFn()).toBeUndefined()
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.any(Object),
        expect.arrayContaining(['error'])
      )
    })

    it('should include context in error handling', () => {
      const error = new Error('Test error')
      const fn = () => {
        throw error
      }
      const safeFn = withErrorHandling(fn, { component: 'TestComponent' })

      expect(safeFn()).toBeUndefined()
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({ component: 'TestComponent' }),
        expect.arrayContaining(['error'])
      )
    })
  })

  describe('withAsyncErrorHandling', () => {
    it('should return the result of the async function if no error occurs', async () => {
      const fn = async () => 'success'
      const safeFn = withAsyncErrorHandling(fn)

      expect(await safeFn()).toBe('success')
      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should handle errors thrown by the async function', async () => {
      const error = new Error('Test error')
      const fn = async () => {
        throw error
      }
      const safeFn = withAsyncErrorHandling(fn)

      expect(await safeFn()).toBeUndefined()
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.any(Object),
        expect.arrayContaining(['error'])
      )
    })

    it('should include context in error handling', async () => {
      const error = new Error('Test error')
      const fn = async () => {
        throw error
      }
      const safeFn = withAsyncErrorHandling(fn, { component: 'TestComponent' })

      expect(await safeFn()).toBeUndefined()
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({ component: 'TestComponent' }),
        expect.arrayContaining(['error'])
      )
    })
  })
})
