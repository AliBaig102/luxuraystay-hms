import axios from "axios";
import type { AxiosInstance, Method } from "axios";
import useSWR, { mutate } from "swr";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { z } from "zod";
import { debounce as debounceFn } from "lodash";
import type {
  ApiResponse,
  UseApiOptions,
  RequestConfig,
  ApiHookReturn,
} from "../types/api";

// API Response Schema for runtime validation
const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    errors: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
          code: z.string().optional(),
          value: z.any().optional(),
        })
      )
      .optional(),
    meta: z
      .object({
        pagination: z.any(),
        total: z.number().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
        hasNext: z.boolean().optional(),
        hasPrev: z.boolean().optional(),
        version: z.string().optional(),
      })
      .optional(),
    timestamp: z.string(),
  });

// Create axios instance with baseURL from environment
const createApiInstance = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const apiInstance = createApiInstance();

// Set auth token function for external use
/**
 * Sets or removes the Authorization header with a Bearer token.
 * @param token - Authentication token or null to remove the header
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiInstance.defaults.headers.common["Authorization"];
  }
};

/**
 * Custom hook for RESTful API interactions with axios and SWR.
 * @template T - Type of the response data
 * @param endpoint - API endpoint path (e.g., '/users', '/health')
 * @param options - Configuration options for the hook
 * @returns An object with SWR data, response, loading states, and request methods
 */
export function useApi<T>(
  endpoint: string,
  options: UseApiOptions<T> = {}
): ApiHookReturn<T> {
  const {
    immediate = true,
    auth = false,
    axiosConfig,
    headers = {},
    swrConfig,
    toastOptions,
    dataSchema,
    onError,
    debounce: enableDebounce = false, // Enable/disable debouncing
    debounceDelay = 300, // Debounce delay in ms
  } = options
  const [isMutating, setIsMutating] = useState(false)
  const { token } = useAuth()

  // Apply token if auth is true
  if (auth && token) {
    setAuthToken(token);
  } else if (auth && !token) {
    setAuthToken(null);
  }

  // Create instance with additional configuration
  const requestInstance: AxiosInstance = axios.create({
    ...apiInstance.defaults,
    headers: { ...apiInstance.defaults.headers, ...headers },
    ...axiosConfig,
  });

  // Propagate errors
  requestInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  // SWR fetcher with optional debouncing and retries
  const fetcher = (
    endpoint: string
  ): Promise<{ data: T; response: ApiResponse<T> }> => {
    const { retryCount = 3, retryDelay = 1000 } = swrConfig || {};
    const fetchFn = async () => {
      let lastError: unknown;
      for (let i = 0; i <= retryCount; i++) {
        try {
          const response = await requestInstance.get(endpoint);
          const parsed = dataSchema
            ? ApiResponseSchema(dataSchema).safeParse(response.data)
            : { success: true, data: response.data };
          if (!parsed.success) {
            throw new Error(
              `Invalid API response: ${
                "error" in parsed ? parsed.error?.message : "Unknown error"
              }`
            );
          }
          return { data: parsed.data.data as T, response: parsed.data };
        } catch (error) {
          lastError = error;
          if (i < retryCount) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }
      throw lastError;
    };

    // Apply debouncing only if enabled
    if (enableDebounce) {
      const debouncedFn = debounceFn(fetchFn, debounceDelay);
      const result = debouncedFn();
      return result || fetchFn(); // Fallback if debounced function returns undefined
    }
    return fetchFn();
  };

  // SWR hook
  const swrResponse = useSWR<{ data: T; response: ApiResponse<T> }>(
    immediate ? endpoint : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...swrConfig,
    }
  );

  /**
   * Generic request wrapper with retries and cancellation
   * @template R - Type of the response data
   * @param method - HTTP method (GET, POST, PUT, etc.)
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @param reqConfig - Request configuration
   * @returns Promise resolving to an object with data and full response
   */
  const request = async <R>(
    method: Method,
    endpoint: string,
    data?: unknown,
    reqConfig: RequestConfig = {}
  ): Promise<{ data: R; response: ApiResponse<R> }> => {
    const {
      message = true,
      silent = false,
      config,
      retryCount = 0,
      retryDelay = 1000,
      optimisticUpdate,
    } = reqConfig;
    const abortController = new AbortController();
    setIsMutating(true);

    if (optimisticUpdate && method !== "get") {
      await mutate(endpoint, optimisticUpdate, false); // Optimistic update
    }

    let lastError: unknown;
    for (let i = 0; i <= retryCount; i++) {
      try {
        const response = await requestInstance.request<ApiResponse<R>>({
          method,
          url: endpoint,
          data,
          ...config,
          signal: abortController.signal,
        });

        const parsed = dataSchema
          ? ApiResponseSchema(dataSchema).safeParse(response.data)
          : { success: true, data: response.data };
        if (!parsed.success) {
          throw new Error(
            `Invalid API response: ${
              "error" in parsed ? parsed.error?.message : "Unknown error"
            }`
          );
        }

        if (message && !silent && parsed.data.success) {
          toast.success(
            parsed.data.message ?? "Operation completed successfully",
            toastOptions
          );
        }
        await mutate(endpoint); // Revalidate cache
        return { data: parsed.data.data as R, response: parsed.data as ApiResponse<R> };
      } catch (error: unknown) {
        if (
          axios.isCancel(error) ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          console.log("Request cancelled:", endpoint);
          return Promise.reject(error);
        }
        lastError = error;
        if (i < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      } finally {
        if (i === retryCount) {
          setIsMutating(false);
        }
      }
    }

    let errMsg = { message: "An error occurred" };
    let statusCode: number | undefined;
    if (axios.isAxiosError(lastError)) {
      statusCode = lastError.response?.status;
      errMsg = lastError.response?.data || { message: lastError.message };
      if (statusCode === 401) {
        errMsg.message = "Unauthorized: Please log in again";
      } else if (statusCode === 403) {
        errMsg.message = "Forbidden: You lack permission";
      } else if (statusCode === 429) {
        errMsg.message = "Too Many Requests: Please try again later";
      }
    } else {
      errMsg.message = (lastError as Error).message;
    }

    if (!silent) {
      toast.error(
        `${errMsg.message}`,
        toastOptions
      );
    }

    if (onError) {
      onError(lastError, endpoint, method);
    }

    await mutate(endpoint); // Revalidate on error
    throw lastError;
  };

  /**
   * Performs a GET request
   * @template R - Type of the response data
   * @param endpoint - API endpoint path
   * @param cfg - Request configuration
   * @returns Promise resolving to an object with data and full response
   */
  const get = <R = T>(endpoint: string, cfg: RequestConfig = {}) =>
    request<R>("get", endpoint, undefined, cfg);

  /**
   * Performs a POST request
   * @template R - Type of the response data
   * @param endpoint - API endpoint path
   * @param body - Request payload
   * @param cfg - Request configuration
   * @returns Promise resolving to an object with data and full response
   */
  const post = <R = T>(endpoint: string, body: unknown, cfg: RequestConfig = {}) =>
    request<R>("post", endpoint, body, cfg);

  /**
   * Performs a PUT request
   * @template R - Type of the response data
   * @param endpoint - API endpoint path
   * @param body - Request payload
   * @param cfg - Request configuration
   * @returns Promise resolving to an object with data and full response
   */
  const put = <R = T>(endpoint: string, body: unknown, cfg: RequestConfig = {}) =>
    request<R>("put", endpoint, body, cfg);

  /**
   * Performs a PATCH request
   * @template R - Type of the response data
   * @param endpoint - API endpoint path
   * @param body - Request payload
   * @param cfg - Request configuration
   * @returns Promise resolving to an object with data and full response
   */
  const patch = <R = T>(
    endpoint: string,
    body: unknown,
    cfg: RequestConfig = {}
  ) => request<R>("patch", endpoint, body, cfg);

  /**
   * Performs a DELETE request
   * @template R - Type of the response data
   * @param endpoint - API endpoint path
   * @param cfg - Request configuration
   * @returns Promise resolving to an object with data and full response
   */
  const del = <R = T>(endpoint: string, cfg: RequestConfig = {}) =>
    request<R>("delete", endpoint, undefined, cfg);

  /**
   * Invalidates one or more SWR cache keys
   * @param keys - Cache key(s) to invalidate
   * @returns Promise that resolves when invalidation is complete
   */
  const invalidate = async (keys?: string | string[]) => {
    if (!keys) return;
    const list = Array.isArray(keys) ? keys : [keys];
    await Promise.all(list.map((key) => mutate(key)));
  };

  /**
   * Uploads a file with progress tracking
   * @param endpoint - API endpoint path
   * @param file - File to upload
   * @param onProgress - Callback for upload progress
   * @returns Promise resolving to an object with data and full response
   */
  const uploadFile = (
    endpoint: string,
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<{ data: T; response: ApiResponse<T> }> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<T>("post", endpoint, formData, {
      config: {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress
          ? (event) =>
              onProgress(Math.round((100 * event.loaded) / event.total!))
          : undefined,
      },
    });
  };

  /**
   * Executes multiple requests concurrently
   * @template R - Type of the response data
   * @param requests - Array of request configurations
   * @returns Promise resolving to an array of objects with data and full response
   */
  const batch = async <R>(
    requests: { method: Method; endpoint: string; data?: unknown }[]
  ): Promise<{ data: R; response: ApiResponse<R> }[]> => {
    setIsMutating(true);
    try {
      const results = await Promise.all(
        requests.map(({ method, endpoint, data }) =>
          requestInstance
            .request<ApiResponse<R>>({ method, url: endpoint, data })
            .then((res) => {
              if (dataSchema) {
                const parsed = ApiResponseSchema(dataSchema).safeParse(res.data);
                if (!parsed.success) {
                  throw new Error(
                    `Invalid API response: ${
                      "error" in parsed ? parsed.error?.message : "Unknown error"
                    }`
                  );
                }
                return { data: parsed.data.data as R, response: parsed.data };
              } else {
                return { data: res.data.data as R, response: res.data };
              }
            })
        )
      );
      return results as { data: R; response: ApiResponse<R> }[];
    } catch (error: unknown) {
      const errMsg =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data
          : { message: (error as Error).message };

      toast.error(errMsg.message || "Batch request failed", toastOptions);
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
    };
  }, []);

  return {
    ...swrResponse,
    data: swrResponse.data?.data,
    response: swrResponse.data?.response,
    isFetching: swrResponse.isLoading || swrResponse.isValidating,
    isMutating,
    mutate: swrResponse.mutate,
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

export { apiInstance };