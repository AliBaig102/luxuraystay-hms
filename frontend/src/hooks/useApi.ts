import axios from 'axios'
import type { AxiosInstance, AxiosResponse, Method } from 'axios'
import useSWR, { mutate } from 'swr'
import type { SWRConfiguration } from 'swr'
import { toast } from 'react-toastify'
import { useState } from 'react'
import type {
  ApiResponse,
  UseApiOptions,
  RequestConfig,
  ApiHookReturn,
} from '../types/api'

// Create axios instance with baseURL from environment
const createApiInstance = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const apiInstance = createApiInstance()

// Set auth token function for external use
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiInstance.defaults.headers.common['Authorization']
  }
}

/**
 * Custom hook for RESTful API interactions with axios + SWR.
 * @param endpoint - API endpoint path (e.g., '/users', '/health')
 * @param options - Hook configuration
 */
export function useApi<T>(endpoint: string, options: UseApiOptions<T> = {}): ApiHookReturn<T> {
  const { immediate = true, axiosConfig, headers = {}, swrConfig, toastOptions } = options
  const [isLoading, setIsLoading] = useState(false)
  
  // Create instance with additional configuration
  const requestInstance: AxiosInstance = axios.create({
    ...apiInstance.defaults,
    headers: { ...apiInstance.defaults.headers, ...headers },
    ...axiosConfig,
  })

  // Propagate errors
  requestInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  )

  // SWR fetcher returns typed data
  const fetcher = (endpoint: string): Promise<T> =>
    requestInstance.get<ApiResponse<T>>(endpoint).then((res: AxiosResponse<ApiResponse<T>>) => res.data.data as T)

  // SWR hook
  const swrResponse = useSWR<T>(immediate ? endpoint : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    ...swrConfig,
  })

  /**
   * Generic request wrapper
   */
  const request = async <R>(
    method: Method,
    endpoint: string,
    data?: unknown,
    reqConfig: RequestConfig = {},
  ): Promise<R> => {
    const { message = true, silent = false, config } = reqConfig
    setIsLoading(true)
    try {
      const response = await requestInstance.request<ApiResponse<R>>({
        method,
        url: endpoint,
        data,
        ...config,
      })

      if (message && !silent && response.data.success) {
        toast.success(
          response.data.message ?? 'Operation completed successfully',
          toastOptions,
        )
      }
      return response.data.data as R
    } catch (error: unknown) {
      const errMsg = axios.isAxiosError(error) && error.response?.data 
        ? error.response.data 
        : { message: (error as Error).message }
      
      if (!silent) {
        toast.error(errMsg.message || 'An error occurred', toastOptions)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Shorthand methods
  const get = <R = T>(endpoint: string, cfg?: RequestConfig) => request<R>('get', endpoint, undefined, cfg)
  const post = <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) =>
    request<R>('post', endpoint, body, cfg)
  const put = <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) =>
    request<R>('put', endpoint, body, cfg)
  const patch = <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) =>
    request<R>('patch', endpoint, body, cfg)
  const del = <R = T>(endpoint: string, cfg?: RequestConfig) => request<R>('delete', endpoint, undefined, cfg)

  // Invalidate one or more SWR cache keys
  const invalidate = async (keys?: string | string[]) => {
    if (!keys) return
    const list = Array.isArray(keys) ? keys : [keys]
    await Promise.all(list.map((key) => mutate(key)))
  }

  // File upload with progress callback
  const uploadFile = (
    endpoint: string,
    file: File,
    onProgress?: (percentage: number) => void,
  ): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)
    return request<T>('post', endpoint, formData, {
      config: {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (event) => onProgress(Math.round((100 * event.loaded) / event.total!))
          : undefined,
      },
    })
  }

  return {
    ...swrResponse,
    isLoading,
    get,
    post,
    put,
    patch,
    delete: del,
    invalidate,
    uploadFile,
  }
}

// Legacy exports for backward compatibility
export function useAPI<T = any>(
  url: string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate: mutateFn } = useSWR<ApiResponse<T>>(
    url,
    async (url: string) => {
      try {
        const response: AxiosResponse<ApiResponse<T>> = await apiInstance.get(url)
        return response.data
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'An error occurred')
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  )

  return {
    data: data?.data,
    error,
    isLoading,
    mutate: mutateFn,
    response: data,
  }
}

export function useAPIMutation() {
  const mutation = async <T = any>(
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    showSuccessToast = true
  ): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiInstance.request({
        method,
        url,
        data,
      })

      if (showSuccessToast && response.data.message) {
        toast.success(response.data.message)
      }

      mutate(url)
      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred')
      throw error
    }
  }

  return {
    post: <T = any>(url: string, data?: any, showSuccessToast = true) =>
      mutation<T>('POST', url, data, showSuccessToast),
    put: <T = any>(url: string, data?: any, showSuccessToast = true) =>
      mutation<T>('PUT', url, data, showSuccessToast),
    patch: <T = any>(url: string, data?: any, showSuccessToast = true) =>
      mutation<T>('PATCH', url, data, showSuccessToast),
    delete: <T = any>(url: string, showSuccessToast = true) =>
      mutation<T>('DELETE', url, undefined, showSuccessToast),
  }
}

// Export the axios instance for direct use if needed
export { apiInstance }