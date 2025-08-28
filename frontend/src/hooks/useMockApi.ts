import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import type {
  ApiResponse,
  UseApiOptions,
  RequestConfig,
  ApiHookReturn,
} from '../types/api';
import type { KeyedMutator } from 'swr';
import {
  roomService,
  reservationService,
  housekeepingService,
  userService,
  authService,
} from '../mock/services';

// Mock service mapping
const serviceMap: Record<string, any> = {
  '/rooms': roomService,
  '/reservations': reservationService,
  '/housekeeping': housekeepingService,
  '/users': userService,
  '/auth': authService,
};

// Helper function to get service and method from endpoint
const getServiceMethod = (endpoint: string, method: string) => {
  const baseEndpoint = endpoint.split('/').slice(0, 2).join('/');
  const service = serviceMap[baseEndpoint];
  
  if (!service) {
    throw new Error(`No mock service found for endpoint: ${endpoint}`);
  }

  // Map HTTP methods to service methods
  const methodMap: Record<string, string> = {
    get: endpoint.includes('/') && endpoint.split('/').length > 2 ? 'getById' : 'getAll',
    post: 'create',
    put: 'update',
    patch: 'update',
    delete: 'delete',
  };

  const serviceMethod = methodMap[method.toLowerCase()];
  if (!serviceMethod || !service[serviceMethod]) {
    throw new Error(`Method ${method} not supported for endpoint: ${endpoint}`);
  }

  return { service, method: serviceMethod };
};

// Helper function to extract ID from endpoint
const extractIdFromEndpoint = (endpoint: string): string | undefined => {
  const parts = endpoint.split('/');
  return parts.length > 2 ? parts[2] : undefined;
};

/**
 * Mock API hook that mimics the useApi interface but uses mock data
 * @template T - Type of the response data
 * @param endpoint - API endpoint path
 * @param options - Configuration options for the hook
 * @returns An object with mock data, loading states, and request methods
 */
export function useMockApi<T>(
  endpoint: string,
  options: UseApiOptions<T> = {}
): ApiHookReturn<T> {
  const {
    immediate = true,
    toastOptions,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [response, setResponse] = useState<ApiResponse<T> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(immediate);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial data fetch
  useEffect(() => {
    if (immediate && endpoint) {
      fetchData();
    }
  }, [endpoint, immediate]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { service, method } = getServiceMethod(endpoint, 'get');
      const id = extractIdFromEndpoint(endpoint);
      
      let result;
      if (method === 'getById' && id) {
        result = await service.getById(id);
      } else {
        result = await service.getAll();
      }
      
      setData(result.data);
      setResponse(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (onError) {
        onError(error, endpoint, 'get');
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, onError]);

  /**
   * Generic request wrapper for mock services
   */
  const request = async <R>(
    method: string,
    requestEndpoint: string,
    requestData?: unknown,
    reqConfig: RequestConfig = {}
  ): Promise<{ data: R; response: ApiResponse<R> }> => {
    const {
      message = true,
      silent = false,
    } = reqConfig;

    try {
      setIsMutating(true);
      setError(null);

      const { service, method: serviceMethod } = getServiceMethod(requestEndpoint, method);
      const id = extractIdFromEndpoint(requestEndpoint);

      let result;
      switch (serviceMethod) {
        case 'getAll':
          result = await service.getAll();
          break;
        case 'getById':
          if (!id) throw new Error('ID required for getById operation');
          result = await service.getById(id);
          break;
        case 'create':
          result = await service.create(requestData);
          break;
        case 'update':
          if (!id) throw new Error('ID required for update operation');
          result = await service.update(id, requestData);
          break;
        case 'delete':
          if (!id) throw new Error('ID required for delete operation');
          result = await service.delete(id);
          break;
        default:
          throw new Error(`Unsupported method: ${serviceMethod}`);
      }

      if (message && !silent && result.success) {
        toast.success(result.message, toastOptions);
      }

      // Update local data if this is the same endpoint
      if (requestEndpoint === endpoint) {
        setData(result.data);
        setResponse(result);
      }

      return { data: result.data as R, response: result as ApiResponse<R> };
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (!silent) {
        toast.error(error.message, toastOptions);
      }

      if (onError) {
        onError(error, requestEndpoint, method.toLowerCase() as any);
      }

      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * Performs a GET request
   */
  const get = <R = T>(requestEndpoint: string, cfg: RequestConfig = {}) =>
    request<R>('get', requestEndpoint, undefined, cfg);

  /**
   * Performs a POST request
   */
  const post = <R = T>(requestEndpoint: string, body: unknown, cfg: RequestConfig = {}) =>
    request<R>('post', requestEndpoint, body, cfg);

  /**
   * Performs a PUT request
   */
  const put = <R = T>(requestEndpoint: string, body: unknown, cfg: RequestConfig = {}) =>
    request<R>('put', requestEndpoint, body, cfg);

  /**
   * Performs a PATCH request
   */
  const patch = <R = T>(requestEndpoint: string, body: unknown, cfg: RequestConfig = {}) =>
    request<R>('patch', requestEndpoint, body, cfg);

  /**
   * Performs a DELETE request
   */
  const del = <R = T>(requestEndpoint: string, cfg: RequestConfig = {}) =>
    request<R>('delete', requestEndpoint, undefined, cfg);

  /**
   * Invalidates cache (mock implementation - just refetches data)
   */
  const invalidate = async () => {
    if (endpoint) {
      await fetchData();
    }
  };

  /**
   * Mock file upload
   */
  const uploadFile = async (
    requestEndpoint: string,
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<{ data: T; response: ApiResponse<T> }> => {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => onProgress(i), i * 10);
      }
    }

    // Mock successful upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse: ApiResponse<T> = {
      success: true,
      message: 'File uploaded successfully',
      data: { url: `mock://uploaded/${file.name}` } as T,
      timestamp: new Date().toISOString(),
    };

    return { data: mockResponse.data!, response: mockResponse };
  };

  /**
   * Mock batch requests
   */
  const batch = async <R>(
    requests: { method: string; endpoint: string; data?: unknown }[]
  ): Promise<{ data: R; response: ApiResponse<R> }[]> => {
    setIsMutating(true);
    try {
      const results = await Promise.all(
        requests.map(({ method, endpoint: reqEndpoint, data: reqData }) =>
          request<R>(method, reqEndpoint, reqData)
        )
      );
      return results;
    } finally {
      setIsMutating(false);
    }
  };

  /**
   * Mock mutate function that matches KeyedMutator interface
   */
  const mutate: KeyedMutator<{ data: T; response: ApiResponse<T> }> = async (
    updatedData?,
    shouldRevalidate = true
  ) => {
    if (updatedData !== undefined) {
      // If data is provided, use it directly
      if (typeof updatedData === 'function') {
        const currentValue = data && response ? { data, response } : undefined;
        const newValue = updatedData(currentValue);
        if (newValue) {
          if ('data' in newValue) setData(newValue.data);
          if ('response' in newValue) setResponse(newValue.response);
          return newValue;
        }
      } else {
        // Direct data update
        if ('data' in updatedData) setData(updatedData.data);
        if ('response' in updatedData) setResponse(updatedData.response);
        return updatedData;
      }
    }
    
    if (shouldRevalidate) {
      await fetchData();
    }
    
    // Ensure we always return non-undefined values
    const currentData = data;
    const currentResponse = response;
    
    if (currentData !== undefined && currentResponse !== undefined) {
      return { data: currentData, response: currentResponse };
    }
    
    // If no data exists, throw an error or return a default
    throw new Error('No data available to return from mutate');
  };

  return {
    error: error as Error | undefined,
    data,
    response,
    isLoading,
    isValidating: false,
    isFetching: isLoading,
    isMutating,
    mutate,
    get,
    post,
    put,
    patch,
    delete: del,
    invalidate,
    uploadFile,
    batch,
  };
}

export default useMockApi;