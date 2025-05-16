// hooks/useApi.ts
import { useState, useCallback } from 'react';

import { ApiError, createApiClient } from '@/lib/api/error-handling';

interface UseApiOptions {
  baseUrl?: string;
  onError?: (error: ApiError) => void;
}

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

/**
 * Hook for making API requests with error handling
 * @param options API options
 * @returns API state and request functions
 */
export function useApi<T = any>(options: UseApiOptions = {}) {
  const { baseUrl = '', onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const apiClient = createApiClient(baseUrl);

  /**
   * Make a GET request
   * @param url API endpoint URL
   * @param params Query parameters
   * @returns Response data
   */
  const get = useCallback(
    async (url: string, params?: Record<string, string>): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Add query parameters to URL
        const urlWithParams = params ? `${url}?${new URLSearchParams(params)}` : url;

        const data = await apiClient<T>(urlWithParams);

        setState({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);

        setState({ data: null, isLoading: false, error: apiError });

        if (onError) {
          onError(apiError);
        }

        return null;
      }
    },
    [apiClient, onError]
  );

  /**
   * Make a POST request
   * @param url API endpoint URL
   * @param data Request body data
   * @returns Response data
   */
  const post = useCallback(
    async (url: string, data?: any): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const responseData = await apiClient<T>(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        setState({ data: responseData, isLoading: false, error: null });
        return responseData;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);

        setState({ data: null, isLoading: false, error: apiError });

        if (onError) {
          onError(apiError);
        }

        return null;
      }
    },
    [apiClient, onError]
  );

  /**
   * Make a PUT request
   * @param url API endpoint URL
   * @param data Request body data
   * @returns Response data
   */
  const put = useCallback(
    async (url: string, data?: any): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const responseData = await apiClient<T>(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        setState({ data: responseData, isLoading: false, error: null });
        return responseData;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);

        setState({ data: null, isLoading: false, error: apiError });

        if (onError) {
          onError(apiError);
        }

        return null;
      }
    },
    [apiClient, onError]
  );

  /**
   * Make a DELETE request
   * @param url API endpoint URL
   * @returns Response data
   */
  const del = useCallback(
    async (url: string): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const responseData = await apiClient<T>(url, {
          method: 'DELETE',
        });

        setState({ data: responseData, isLoading: false, error: null });
        return responseData;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);

        setState({ data: null, isLoading: false, error: apiError });

        if (onError) {
          onError(apiError);
        }

        return null;
      }
    },
    [apiClient, onError]
  );

  /**
   * Reset API state
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    reset,
  };
}
