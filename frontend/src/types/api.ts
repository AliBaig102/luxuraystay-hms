import type { AxiosRequestConfig } from 'axios'
import type { SWRConfiguration, SWRResponse } from 'swr'
import type { ToastOptions } from 'react-toastify'

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
  get: <R = T>(endpoint: string, cfg?: RequestConfig) => Promise<R>
  post: <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) => Promise<R>
  put: <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) => Promise<R>
  patch: <R = T>(endpoint: string, body: unknown, cfg?: RequestConfig) => Promise<R>
  delete: <R = T>(endpoint: string, cfg?: RequestConfig) => Promise<R>
  invalidate: (keys?: string | string[]) => Promise<void>
  uploadFile: (endpoint: string, file: File, onProgress?: (percentage: number) => void) => Promise<T>
}