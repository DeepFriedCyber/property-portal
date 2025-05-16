// fetchUtils.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Custom error types
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Default options
const defaultOptions = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  backoffFactor: 2,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Fetch with timeout utility function
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeout Timeout in milliseconds
 * @returns Response object
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = defaultOptions.timeout
): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${timeout}ms`);
      }
      throw new NetworkError(`Network error: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Fetch with retry and exponential backoff
 * @param url URL to fetch
 * @param options Fetch options
 * @param retries Maximum number of retries
 * @param backoff Initial backoff in milliseconds
 * @param timeout Timeout in milliseconds
 * @returns Parsed JSON response
 */
export const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit = {},
  retries = defaultOptions.maxRetries,
  backoff = defaultOptions.backoffFactor * 100,
  timeout = defaultOptions.timeout
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);

      if (!response.ok) {
        const status = response.status;
        const shouldRetry = defaultOptions.retryStatusCodes.includes(status);

        // Don't retry for certain status codes
        if (!shouldRetry && attempt < retries) {
          throw new ApiError(`HTTP error! Status: ${status}`, status);
        }

        throw new ApiError(`HTTP error! Status: ${status}`, status);
      }

      return await response.json();
    } catch (err) {
      const error = err as Error;
      lastError = error;

      // Don't retry if we've reached max retries
      if (attempt === retries) break;

      // Don't retry for certain errors
      if (error instanceof ApiError) {
        // Don't retry for client errors (except those in retryStatusCodes)
        if (
          error.status >= 400 &&
          error.status < 500 &&
          !defaultOptions.retryStatusCodes.includes(error.status)
        ) {
          break;
        }
      }

      // Wait with exponential backoff before retrying
      const delay = backoff * Math.pow(2, attempt);
      console.log(`Retrying fetch (${attempt + 1}/${retries}) after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Axios with retry and exponential backoff
 * @param config Axios request config
 * @param retries Maximum number of retries
 * @param backoff Initial backoff in milliseconds
 * @returns Axios response
 */
export const axiosWithRetry = async <T>(
  config: AxiosRequestConfig,
  retries = defaultOptions.maxRetries,
  backoff = defaultOptions.backoffFactor * 100
): Promise<AxiosResponse<T>> => {
  // Set default timeout if not provided
  if (!config.timeout) {
    config.timeout = defaultOptions.timeout;
  }

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.request<T>(config);
    } catch (err) {
      const error = err as Error;
      lastError = error;

      // Don't retry if we've reached max retries
      if (attempt === retries) break;

      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Don't retry for timeout errors
        if (axiosError.code === 'ECONNABORTED') {
          throw new TimeoutError(`Request timed out after ${config.timeout}ms`);
        }

        // Don't retry for certain status codes
        if (axiosError.response) {
          const status = axiosError.response.status;
          const shouldRetry = defaultOptions.retryStatusCodes.includes(status);

          if (!shouldRetry && status >= 400 && status < 500) {
            break;
          }
        }
      }

      // Wait with exponential backoff before retrying
      const delay = backoff * Math.pow(2, attempt);
      console.log(`Retrying axios request (${attempt + 1}/${retries}) after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Create a circuit breaker for API calls
 * @param options Circuit breaker options
 * @returns Circuit breaker object
 */
export const createCircuitBreaker = (options: {
  name: string;
  failureThreshold?: number;
  resetTimeout?: number;
}) => {
  const state = {
    failures: 0,
    lastFailure: null as number | null,
    status: 'CLOSED' as 'CLOSED' | 'OPEN' | 'HALF_OPEN',
  };

  const failureThreshold = options.failureThreshold || 5;
  const resetTimeout = options.resetTimeout || 30000; // 30 seconds

  return {
    /**
     * Check if circuit breaker allows the request
     * @returns Whether the request is allowed
     */
    canMakeRequest(): boolean {
      // If circuit is closed, allow the request
      if (state.status === 'CLOSED') {
        return true;
      }

      // If circuit is open, check if it's time to try again
      if (state.status === 'OPEN') {
        const now = Date.now();
        if (state.lastFailure && now - state.lastFailure > resetTimeout) {
          // Move to half-open state
          state.status = 'HALF_OPEN';
          console.log(`Circuit breaker ${options.name} is now HALF_OPEN`);
          return true;
        }
        return false;
      }

      // If circuit is half-open, allow one test request
      return true;
    },

    /**
     * Record a successful request
     */
    recordSuccess(): void {
      if (state.status === 'HALF_OPEN') {
        // Reset the circuit breaker
        state.failures = 0;
        state.lastFailure = null;
        state.status = 'CLOSED';
        console.log(`Circuit breaker ${options.name} is now CLOSED`);
      }
    },

    /**
     * Record a failed request
     */
    recordFailure(): void {
      state.failures += 1;
      state.lastFailure = Date.now();

      if (state.status === 'CLOSED' && state.failures >= failureThreshold) {
        state.status = 'OPEN';
        console.log(`Circuit breaker ${options.name} is now OPEN`);
      } else if (state.status === 'HALF_OPEN') {
        state.status = 'OPEN';
        console.log(`Circuit breaker ${options.name} is now OPEN after failed test`);
      }
    },

    /**
     * Get the current status of the circuit breaker
     * @returns Circuit breaker status
     */
    getStatus(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
      return state.status;
    },

    /**
     * Reset the circuit breaker
     */
    reset(): void {
      state.failures = 0;
      state.lastFailure = null;
      state.status = 'CLOSED';
      console.log(`Circuit breaker ${options.name} has been reset`);
    },
  };
};

/**
 * Execute a function with circuit breaker protection
 * @param fn Function to execute
 * @param circuitBreaker Circuit breaker object
 * @param fallbackFn Optional fallback function
 * @returns Result of the function or fallback
 */
export const withCircuitBreaker = async <T>(
  fn: () => Promise<T>,
  circuitBreaker: ReturnType<typeof createCircuitBreaker>,
  fallbackFn?: () => Promise<T>
): Promise<T> => {
  if (!circuitBreaker.canMakeRequest()) {
    if (fallbackFn) {
      console.log('Circuit breaker is OPEN, using fallback');
      return fallbackFn();
    }
    throw new Error('Service is unavailable and no fallback is available');
  }

  try {
    const result = await fn();
    circuitBreaker.recordSuccess();
    return result;
  } catch (error) {
    circuitBreaker.recordFailure();

    if (fallbackFn) {
      console.log('Primary function failed, using fallback');
      return fallbackFn();
    }

    throw error;
  }
};
