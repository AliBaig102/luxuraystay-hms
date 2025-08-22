import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import useSWR, { mutate } from 'swr'
import type { SWRConfiguration, SWRResponse } from 'swr'
import { toast } from 'react-toastify'
import type { ToastOptions } from 'react-toastify'
import { useState } from 'react'
import { axiosInstance } from './http'

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: ValidationError[]
  meta?: ResponseMeta | undefined
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  code?: string | undefined
  value?: any
}

export interface ResponseMeta {
  pagination?: PaginationMeta
  total?: number
  page?: number
  limit?: number
  hasNext?: boolean
  hasPrev?: boolean
  version?: string
  [key: string]: any
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number | null
  prevPage?: number | null
}

// Hook Configuration Interfaces
export interface UseApiOptions<T> {
  /** Disable automatic fetch on mount */
  immediate?: boolean
  /** Default axios configuration overrides */
  axiosConfig?: AxiosRequestConfig
  /** Global headers to apply to all requests */
  headers?: Record<string, string>
  /** SWR configuration overrides */
  swrConfig?: SWRConfiguration<T, Error>
  /** Toast options for success/error notifications */
  toastOptions?: ToastOptions
}

export interface RequestConfig {
  /** Show success toast */
  message?: boolean
  /** Suppress all toasts (success & error) */
  silent?: boolean
  /** Axios config overrides for this request */
  config?: AxiosRequestConfig
}

export interface ApiHookReturn<T> extends SWRResponse<T, Error> {
  get: <R = T>(url: string, cfg?: RequestConfig) => Promise<R>
  post: <R = T>(url: string, body: unknown, cfg?: RequestConfig) => Promise<R>
  put: <R = T>(url: string, body: unknown, cfg?: RequestConfig) => Promise<R>
  patch: <R = T>(url: string, body: unknown, cfg?: RequestConfig) => Promise<R>
  delete: <R = T>(url: string, cfg?: RequestConfig) => Promise<R>
  invalidate: (keys?: string | string[]) => Promise<void>
  uploadFile: (url: string, file: File, onProgress?: (percentage: number) => void) => Promise<T>
}

/**
 * Custom hook for RESTful API interactions with axios + SWR.
 * @param baseUrl - Base URL or key for SWR
 * @param options - Hook configuration
 */
export function useApi<T>(baseUrl: string, options: UseApiOptions<T> = {}): ApiHookReturn<T> {
  const { immediate = true, axiosConfig, headers = {}, swrConfig, toastOptions } = options
  const [isLoading, setIsLoading] = useState(false)
  
  // Use the existing axios instance with additional configuration
  const apiInstance: AxiosInstance = axios.create({
    ...axiosInstance.defaults,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...axiosConfig,
  })

  // Propagate errors
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  )

  // SWR fetcher returns typed data
  const fetcher = (url: string): Promise<T> =>
    apiInstance.get<ApiResponse<T>>(url).then((res: AxiosResponse<ApiResponse<T>>) => res.data.data as T)

  // SWR hook
  const swrResponse = useSWR<T>(immediate ? baseUrl : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    ...swrConfig,
  })

  /**
   * Generic request wrapper
   */
  const request = async <R>(
    method: Method,
    url: string,
    data?: unknown,
    reqConfig: RequestConfig = {},
  ): Promise<R> => {
    const { message = true, silent = false, config } = reqConfig
    setIsLoading(true)
    try {
      const response = await apiInstance.request<ApiResponse<R>>({
        method,
        url,
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
  const get = <R = T>(url: string, cfg?: RequestConfig) => request<R>('get', url, undefined, cfg)
  const post = <R = T>(url: string, body: unknown, cfg?: RequestConfig) =>
    request<R>('post', url, body, cfg)
  const put = <R = T>(url: string, body: unknown, cfg?: RequestConfig) =>
    request<R>('put', url, body, cfg)
  const patch = <R = T>(url: string, body: unknown, cfg?: RequestConfig) =>
    request<R>('patch', url, body, cfg)
  const del = <R = T>(url: string, cfg?: RequestConfig) => request<R>('delete', url, undefined, cfg)

  // Invalidate one or more SWR cache keys
  const invalidate = async (keys?: string | string[]) => {
    if (!keys) return
    const list = Array.isArray(keys) ? keys : [keys]
    await Promise.all(list.map((key) => mutate(key)))
  }

  // File upload with progress callback
  const uploadFile = (
    url: string,
    file: File,
    onProgress?: (percentage: number) => void,
  ): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)
    return request<T>('post', url, formData, {
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
        const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.get(url)
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
      const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.request({
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