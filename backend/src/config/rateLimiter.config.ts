import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits all API requests to 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((Date.now() + 15 * 60 * 1000) / 1000),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits login/register attempts to 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: 'Too many authentication attempts, please try again later.',
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((Date.now() + 15 * 60 * 1000) / 1000),
    });
  },
});

/**
 * Moderate rate limiter for data modification endpoints
 * Limits POST/PUT/DELETE requests to 30 requests per 15 minutes
 */
export const dataModificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    status: false,
    message: 'Too many data modification requests, please try again later.',
    error: 'DATA_MODIFICATION_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: false,
      message: 'Too many data modification requests, please try again later.',
      error: 'DATA_MODIFICATION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((Date.now() + 15 * 60 * 1000) / 1000),
    });
  },
});

/**
 * Health check rate limiter (more lenient)
 * Limits health check requests to 1000 requests per 15 minutes
 */
export const healthCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    status: false,
    message: 'Too many health check requests, please try again later.',
    error: 'HEALTH_CHECK_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
