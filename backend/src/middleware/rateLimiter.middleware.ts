import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { authLimiter, dataModificationLimiter } from '../config';

/**
 * Apply authentication rate limiting to routes
 * Use this middleware for login, register, password reset, etc.
 */
export const applyAuthRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authLimiter(req, res, next);
};

/**
 * Apply data modification rate limiting to routes
 * Use this middleware for POST, PUT, DELETE operations
 */
export const applyDataModificationRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  dataModificationLimiter(req, res, next);
};

/**
 * Custom rate limiter for specific endpoints
 * @param windowMs - Time window in milliseconds
 * @param max - Maximum requests per window
 * @param message - Custom error message
 */
export const createCustomRateLimit = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: false,
      message,
      error: 'CUSTOM_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: false,
        message,
        error: 'CUSTOM_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((Date.now() + windowMs) / 1000),
      });
    },
  });
};
