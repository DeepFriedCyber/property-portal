// lib/api/error-handling.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  ApiError, 
  handleFetchError, 
  parseApiResponse,
  createApiClient
} from './error-handling';

describe('ApiError', () => {
  it('should create an ApiError with the correct properties', () => {
    const error = new ApiError('Test error', 400, 'BAD_REQUEST', { field: 'value' });
    
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.details).toEqual({ field: 'value' });
    expect(error.name).toBe('ApiError');
  });
  
  it('should identify validation errors correctly', () => {
    const validationError = new ApiError('Validation error', 422, 'VALIDATION_ERROR');
    const otherError = new ApiError('Other error', 500);
    
    expect(validationError.isValidationError()).toBe(true);
    expect(otherError.isValidationError()).toBe(false);
  });
  
  it('should get validation errors as a record', () => {
    const error = new ApiError('Validation error', 422, 'VALIDATION_ERROR', {
      name: 'Name is required',
      email: 'Email is invalid'
    });
    
    expect(error.getValidationErrors()).toEqual({
      name: 'Name is required',
      email: 'Email is invalid'
    });
  });
  
  it('should handle array format validation errors', () => {
    const error = new ApiError('Validation error', 422, 'VALIDATION_ERROR', [
      { path: 'name', message: 'Name is required' },
      { path: 'email', message: 'Email is invalid' }
    ]);
    
    expect(error.getValidationErrors()).toEqual({
      name: 'Name is required',
      email: 'Email is invalid'
    });
  });
  
  it('should return empty object for non-validation errors', () => {
    const error = new ApiError('Other error', 500);
    
    expect(error.getValidationErrors()).toEqual({});
  });
  
  it('should create an ApiError from a Response object', async () => {
    const mockResponse = {
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: {
          message: 'Bad request',
          code: 'BAD_REQUEST',
          details: { field: 'value' }
        }
      })
    } as unknown as Response;
    
    const error = await ApiError.fromResponse(mockResponse);
    
    expect(error.message).toBe('Bad request');
    expect(error.status).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.details).toEqual({ field: 'value' });
  });
  
  it('should handle responses without error details', async () => {
    const mockResponse = {
      status: 500,
      json: vi.fn().mockResolvedValue({})
    } as unknown as Response;
    
    const error = await ApiError.fromResponse(mockResponse);
    
    expect(error.message).toBe('An unexpected error occurred');
    expect(error.status).toBe(500);
  });
  
  it('should handle JSON parse errors', async () => {
    const mockResponse = {
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as Response;
    
    const error = await ApiError.fromResponse(mockResponse);
    
    expect(error.message).toBe('Failed to parse error response');
    expect(error.status).toBe(500);
  });
});

describe('handleFetchError', () => {
  it('should not throw for successful responses', async () => {
    const mockResponse = {
      ok: true
    } as Response;
    
    await expect(handleFetchError(mockResponse)).resolves.not.toThrow();
  });
  
  it('should throw ApiError for unsuccessful responses', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: {
          message: 'Bad request',
          code: 'BAD_REQUEST'
        }
      })
    } as unknown as Response;
    
    await expect(handleFetchError(mockResponse)).rejects.toThrow(ApiError);
    await expect(handleFetchError(mockResponse)).rejects.toThrow('Bad request');
  });
});

describe('parseApiResponse', () => {
  it('should parse successful responses', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Test' }
      })
    } as unknown as Response;
    
    const result = await parseApiResponse(mockResponse);
    
    expect(result).toEqual({ id: 1, name: 'Test' });
  });
  
  it('should throw ApiError for unsuccessful responses', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: {
          message: 'Bad request',
          code: 'BAD_REQUEST'
        }
      })
    } as unknown as Response;
    
    await expect(parseApiResponse(mockResponse)).rejects.toThrow(ApiError);
    await expect(parseApiResponse(mockResponse)).rejects.toThrow('Bad request');
  });
  
  it('should throw ApiError for JSON parse errors', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as Response;
    
    await expect(parseApiResponse(mockResponse)).rejects.toThrow(ApiError);
    await expect(parseApiResponse(mockResponse)).rejects.toThrow('Failed to parse response data');
  });
});

describe('createApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });
  
  it('should create a fetch wrapper with the correct base URL', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Test' }
      })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const apiClient = createApiClient('https://api.example.com');
    const result = await apiClient('/users/1');
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/users/1', undefined);
    expect(result).toEqual({ id: 1, name: 'Test' });
  });
  
  it('should handle API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        error: {
          message: 'User not found',
          code: 'NOT_FOUND'
        }
      })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const apiClient = createApiClient('https://api.example.com');
    
    await expect(apiClient('/users/999')).rejects.toThrow(ApiError);
    await expect(apiClient('/users/999')).rejects.toThrow('User not found');
  });
  
  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    
    const apiClient = createApiClient('https://api.example.com');
    
    await expect(apiClient('/users/1')).rejects.toThrow(ApiError);
    await expect(apiClient('/users/1')).rejects.toThrow('Network error');
  });
  
  it('should pass request options to fetch', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Test' }
      })
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);
    
    const apiClient = createApiClient('https://api.example.com');
    await apiClient('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'New User' })
    });
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'New User' })
    });
  });
});