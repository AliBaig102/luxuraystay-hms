import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema, z } from 'zod';
import { ValidationError } from '../types/api';
import { logger } from '../utils/logger';
import { ResponseUtil } from '../utils/response';

/**
 * Validation Middleware Options
 */
export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  skipOnError?: boolean;
}

/**
 * Validation Middleware Factory
 * Creates middleware for validating request data using Zod schemas
 */
export const validate = (schema: ZodSchema | ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.info('=== VALIDATION MIDDLEWARE CALLED ===', {
      method: req.method,
      path: req.path,
      body: req.body,
      schema: typeof schema,
    });

    // Handle both direct schema and options object
    let options: ValidationOptions;

    if (typeof schema === 'object' && 'safeParse' in schema) {
      // It's a Zod schema - check if it has shape property to extract parts
      if ('shape' in (schema as any)) {
        const schemaShape = (schema as any).shape;
        options = {
          body: schemaShape.body,
          query: schemaShape.query,
          params: schemaShape.params,
          headers: schemaShape.headers,
        };
      } else {
        // It's a simple schema, treat as body validation
        options = { body: schema };
      }
    } else {
      // It's a ValidationOptions object
      options = schema;
    }
    try {
      // If schema is a Zod object schema, extract individual parts
      let { body, query, params, headers } = options;

      if (
        !body &&
        !query &&
        !params &&
        !headers &&
        'shape' in (schema as any)
      ) {
        const schemaShape = (schema as any).shape;
        body = schemaShape.body;
        query = schemaShape.query;
        params = schemaShape.params;
        headers = schemaShape.headers;
      }

      const errors: ValidationError[] = [];

      // Validate request body
      if (body) {
        const bodyResult = body.safeParse(req.body);
        if (!bodyResult.success) {
          errors.push(...formatZodErrors(bodyResult.error, 'body'));
        } else {
          req.body = bodyResult.data as any;
        }
      }

      // Validate query parameters
      if (query) {
        const queryResult = query.safeParse(req.query);
        if (!queryResult.success) {
          errors.push(...formatZodErrors(queryResult.error, 'query'));
        } else {
          req.query = queryResult.data as any;
        }
      }

      // Validate route parameters
      if (params) {
        const paramsResult = params.safeParse(req.params);
        if (!paramsResult.success) {
          errors.push(...formatZodErrors(paramsResult.error, 'params'));
        } else {
          req.params = paramsResult.data as any;
        }
      }

      // Validate headers
      if (headers) {
        const headersResult = headers.safeParse(req.headers);
        if (!headersResult.success) {
          errors.push(...formatZodErrors(headersResult.error, 'headers'));
        } else {
          req.headers = headersResult.data as any;
        }
      }

      // If there are validation errors, return error response
      if (errors.length > 0) {
        logger.warn('Validation middleware - errors found:', errors);
        logger.warn('Validation failed', {
          requestId: res.locals['requestId'],
          errors,
          path: req.path,
          method: req.method,
        });
        ResponseUtil.validationError(res, errors);
        return;
      }

      logger.info('Validation middleware - no errors, continuing...');

      // Continue to next middleware if validation passes
      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: res.locals['requestId'],
        path: req.path,
        method: req.method,
      });
      ResponseUtil.internalError(res, 'Validation processing failed');
      return;
    }
  };
};

/**
 * Format Zod validation errors into our ValidationError format
 */
const formatZodErrors = (
  zodError: ZodError,
  prefix: string
): ValidationError[] => {
  return zodError.issues.map((error: any) => {
    // For body validation, show field names without prefix for cleaner error messages
    // For other types (query, params, headers), keep the prefix for clarity
    let field: string;
    if (prefix === 'body' && error.path.length > 0) {
      field = error.path.join('.');
    } else {
      field =
        prefix + (error.path.length > 0 ? '.' + error.path.join('.') : '');
    }

    return {
      field,
      message: error.message,
      code: error.code,
      value:
        error.path.length > 0
          ? getNestedValue(error.received, error.path)
          : undefined,
    };
  });
};

/**
 * Get nested value from object using path array
 */
const getNestedValue = (obj: any, path: (string | number)[]): any => {
  return path.reduce((current, key) => current?.[key], obj);
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // MongoDB ObjectId validation
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),

  // Email validation
  email: z.string().email('Invalid email format'),

  // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  // Phone number validation
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

  // URL validation
  url: z.string().url('Invalid URL format'),

  // Pagination parameters
  pagination: z.object({
    page: z
      .string()
      .transform(val => parseInt(val, 10))
      .pipe(z.number().min(1, 'Page must be at least 1'))
      .optional()
      .default(1),
    limit: z
      .string()
      .transform(val => parseInt(val, 10))
      .pipe(
        z
          .number()
          .min(1, 'Limit must be at least 1')
          .max(100, 'Limit cannot exceed 100')
      )
      .optional()
      .default(10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // File upload validation
  fileUpload: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
    buffer: z.instanceof(Buffer),
  }),

  // Date range validation
  dateRange: z
    .object({
      startDate: z.string().datetime('Invalid start date format'),
      endDate: z.string().datetime('Invalid end date format'),
    })
    .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
      message: 'Start date must be before or equal to end date',
      path: ['dateRange'],
    }),
};

/**
 * Validation schema builders
 */
export const schemaBuilders = {
  /**
   * Create a schema for array validation with min/max length
   */
  array: <T>(itemSchema: ZodSchema<T>, minLength = 0, maxLength = 100) => {
    return z
      .array(itemSchema)
      .min(minLength, `Array must have at least ${minLength} items`)
      .max(maxLength, `Array cannot have more than ${maxLength} items`);
  },

  /**
   * Create a schema for enum validation with custom error message
   */
  enum: <T extends readonly [string, ...string[]]>(
    values: T,
    fieldName = 'field'
  ) => {
    return z.enum(values, {
      message: `${fieldName} must be one of: ${values.join(', ')}`,
    });
  },

  /**
   * Create a schema for optional string with min/max length
   */
  optionalString: (minLength = 0, maxLength = 255) => {
    return z
      .string()
      .min(minLength, `Must be at least ${minLength} characters`)
      .max(maxLength, `Cannot exceed ${maxLength} characters`)
      .optional();
  },

  /**
   * Create a schema for required string with min/max length
   */
  requiredString: (minLength = 1, maxLength = 255) => {
    return z
      .string()
      .min(minLength, `Must be at least ${minLength} characters`)
      .max(maxLength, `Cannot exceed ${maxLength} characters`);
  },
};
