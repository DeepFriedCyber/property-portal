// hooks/useCentralizedErrorHandler.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';
import { errorService } from '@/lib/error/error-service';
import { ApiError } from '@/lib/api/error-handling';
import { ValidationError } from '@/lib/api/validation';

// Mock the error service
vi.mock('@/lib/error/error-service', () => ({
  errorService: {
    handleError: vi.fn()
  },
  ErrorType: {
    API: 'api',
    VALIDATION: 'validation',
    UNKNOWN: 'unknown'
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/test-path'
}));

describe('useCentralizedErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should initialize with default error state', () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    
    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.errorMessage).toBe('');
    expect(result.current.isApiError).toBe(false);
    expect(result.current.isValidationError).toBe(false);
  });
  
  it('should handle regular errors', () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.errorMessage).toBe('Test error');
    expect(result.current.isApiError).toBe(false);
    expect(result.current.isValidationError).toBe(false);
    expect(errorService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
  });
  
  it('should handle API errors', () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    const error = new ApiError('API error', 500, 'API_ERROR', { detail: 'Error details' });
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.errorMessage).toBe('API error');
    expect(result.current.errorCode).toBe('API_ERROR');
    expect(result.current.isApiError).toBe(true);
    expect(result.current.isValidationError).toBe(false);
    expect(errorService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
  });
  
  it('should handle validation errors', () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    const error = new ValidationError('Validation error', 'VALIDATION_ERROR', {
      field1: 'Field 1 is required',
      field2: 'Field 2 is invalid'
    });
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.errorMessage).toBe('Validation error');
    expect(result.current.errorCode).toBe('VALIDATION_ERROR');
    expect(result.current.isApiError).toBe(false);
    expect(result.current.isValidationError).toBe(true);
    expect(errorService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
  });
  
  it('should reset error state', () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(result.current.hasError).toBe(true);
    
    act(() => {
      result.current.resetError();
    });
    
    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.errorMessage).toBe('');
  });
  
  it('should wrap functions with error handling', () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    const error = new Error('Function error');
    const fn = () => { throw error; };
    
    const safeFn = result.current.withErrorHandling(fn);
    
    act(() => {
      safeFn();
    });
    
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.errorMessage).toBe('Function error');
    expect(errorService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
  });
  
  it('should wrap async functions with error handling', async () => {
    const { result } = renderHook(() => useCentralizedErrorHandler());
    const error = new Error('Async function error');
    const fn = async () => { throw error; };
    
    const safeFn = result.current.withAsyncErrorHandling(fn);
    
    await act(async () => {
      await safeFn();
    });
    
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.errorMessage).toBe('Async function error');
    expect(errorService.handleError).toHaveBeenCalledWith(error, expect.any(Object));
  });
  
  it('should include component and action in error context', () => {
    const { result } = renderHook(() => 
      useCentralizedErrorHandler({
        component: 'TestComponent',
        action: 'testAction',
        tags: ['test-tag']
      })
    );
    
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(errorService.handleError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        component: 'TestComponent',
        action: 'testAction',
        tags: ['test-tag']
      })
    );
  });
  
  it('should call onError callback when provided', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => 
      useCentralizedErrorHandler({ onError })
    );
    
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });
    
    expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
  });
});