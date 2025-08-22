import { Response } from 'express';
import {
  ErrorResponse,
  HttpStatusCode,
  ResponseMeta,
  SuccessResponse,
  ValidationError,
} from '../types/api';
import { logger } from './logger';

/**
 * Response Utility Class
 * Provides standardized methods for API responses
 */
export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: HttpStatusCode = HttpStatusCode.OK,
    meta?: ResponseMeta
  ): Response {
    const response: SuccessResponse<T> = {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };

    logger.info('API Success Response', {
      statusCode,
      message,
      dataType: typeof data,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    errors?: ValidationError[],
    meta?: ResponseMeta
  ): Response {
    const response: ErrorResponse = {
      success: false,
      message,
      data: null,
      errors: errors || [],
      meta,
      timestamp: new Date().toISOString(),
    };

    logger.error('API Error Response', {
      statusCode,
      message,
      errors: errors || [],
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: ValidationError[],
    message: string = 'Validation failed'
  ): Response {
    return this.error(
      res,
      message,
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      errors
    );
  }

  /**
   * Send not found error response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, HttpStatusCode.NOT_FOUND);
  }

  /**
   * Send unauthorized error response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return this.error(res, message, HttpStatusCode.UNAUTHORIZED);
  }

  /**
   * Send forbidden error response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response {
    return this.error(res, message, HttpStatusCode.FORBIDDEN);
  }

  /**
   * Send bad request error response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    errors?: ValidationError[]
  ): Response {
    return this.error(res, message, HttpStatusCode.BAD_REQUEST, errors);
  }

  /**
   * Send conflict error response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): Response {
    return this.error(res, message, HttpStatusCode.CONFLICT);
  }

  /**
   * Send rate limit error response
   */
  static rateLimitExceeded(
    res: Response,
    message: string = 'Rate limit exceeded'
  ): Response {
    return this.error(res, message, HttpStatusCode.TOO_MANY_REQUESTS);
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    error?: Error
  ): Response {
    if (error) {
      logger.error('Internal Server Error', {
        message: error.message,
        stack: error.stack,
      });
    }

    return this.error(res, message, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  /**
   * Send paginated success response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    message: string = 'Data retrieved successfully'
  ): Response {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const meta: ResponseMeta = {
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? currentPage + 1 : null,
        prevPage: hasPrevPage ? currentPage - 1 : null,
      },
      total: totalItems,
      page: currentPage,
      limit: itemsPerPage,
      hasNext: hasNextPage,
      hasPrev: hasPrevPage,
    };

    return this.success(res, data, message, HttpStatusCode.OK, meta);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, HttpStatusCode.CREATED);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(HttpStatusCode.NO_CONTENT).send();
  }
}

/**
 * Helper function to create validation errors
 */
export const createValidationError = (
  field: string,
  message: string,
  code?: string,
  value?: unknown
): ValidationError => ({
  field,
  message,
  code,
  value,
});

/**
 * Helper function to create multiple validation errors
 */
export const createValidationErrors = (
  errors: Array<{
    field: string;
    message: string;
    code?: string;
    value?: unknown;
  }>
): ValidationError[] => {
  return errors.map(error =>
    createValidationError(error.field, error.message, error.code, error.value)
  );
};
