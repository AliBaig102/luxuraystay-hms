import type { AxiosRequestConfig, Method } from "axios"
import type { ToastOptions } from "react-toastify"
import type { SWRConfiguration, SWRResponse, KeyedMutator } from "swr"
import type { z } from "zod"

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
  /** Enable authentication token for requests */
  auth?: boolean
  /** Default axios configuration overrides */
  axiosConfig?: AxiosRequestConfig
  /** Global headers to apply to all requests */
  headers?: Record<string, string>
  /** SWR configuration overrides */
  swrConfig?: SWRConfiguration<{ data: T; response: ApiResponse<T> }, Error> & { retryCount?: number; retryDelay?: number }
  /** Toast options for success/error notifications */
  toastOptions?: ToastOptions
  /** Custom error handler */
  onError?: (error: unknown, endpoint: string, method: Method) => void
  /** Zod schema for response validation */
  dataSchema?: z.ZodType<T>
  /** Enable debouncing for GET requests */
  debounce?: boolean
  /** Debounce delay in milliseconds */
  debounceDelay?: number
}

export interface RequestConfig {
  /** Show success toast */
  message?: boolean
  /** Suppress all toasts (success & error) */
  silent?: boolean
  /** Axios config overrides for this request */
  config?: AxiosRequestConfig
  /** Number of retries for failed requests */
  retryCount?: number
  /** Delay between retries in ms */
  retryDelay?: number
  /** Function to compute optimistic update */
  optimisticUpdate?: <T>(currentData: T | undefined) => T
}

export interface ApiHookReturn<T> extends Omit<SWRResponse<{ data: T; response: ApiResponse<T> }, Error>, 'data' | 'mutate'> {
  /** Response data */
  data?: T
  /** Full API response */
  response?: ApiResponse<T>
  /** Loading state for GET requests */
  isFetching: boolean
  /** Loading state for mutations */
  isMutating: boolean
  /** SWR mutate function */
  mutate: KeyedMutator<{ data: T; response: ApiResponse<T> }>
  /** Perform a GET request */
  get: <R = T>(endpoint: string, cfg?: RequestConfig) => Promise<{ data: R; response: ApiResponse<R> }>
  /** Perform a POST request */
  post: <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) => Promise<{ data: R; response: ApiResponse<R> }>
  /** Perform a PUT request */
  put: <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) => Promise<{ data: R; response: ApiResponse<R> }>
  /** Perform a PATCH request */
  patch: <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) => Promise<{ data: R; response: ApiResponse<R> }>
  /** Perform a DELETE request */
  delete: <R = T>(endpoint: string, cfg?: RequestConfig) => Promise<{ data: R; response: ApiResponse<R> }>
  /** Invalidate cache keys */
  invalidate: (keys?: string | string[]) => Promise<void>
  /** Upload a file */
  uploadFile: (endpoint: string, file: File, onProgress?: (percentage: number) => void) => Promise<{ data: T; response: ApiResponse<T> }>
  /** Execute multiple requests concurrently */
  batch: <R>(requests: { method: Method; endpoint: string; data?: unknown }[]) => Promise<{ data: R; response: ApiResponse<R> }[]>
}