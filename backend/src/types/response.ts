/**
 * Standard API Response Interface
 * Provides a consistent structure for all API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

/**
 * Error Response Interface
 * Used for standardized error responses
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: any;
}

/**
 * Success Response Interface
 * Used for standardized success responses
 */
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}
