import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      service,
      ...meta
    }: winston.Logform.TransformableInfo) => {
      let log = `${timestamp} [${service}] ${level}: ${message}`;

      if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta, null, 2)}`;
      }

      return log;
    }
  )
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  defaultMeta: {
    service: 'luxuraystay-hms-backend',
    environment: process.env['NODE_ENV'] || 'development',
    version: process.env['npm_package_version'] || '1.0.0',
  },
  transports: [
    // Error logs - only errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),

    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true,
    }),

    // Debug logs - debug and above (only in development)
    ...(process.env['NODE_ENV'] === 'development'
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'debug.log'),
            level: 'debug',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 3,
            tailable: true,
          }),
        ]
      : []),
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],

  exitOnError: false,
});

// Add console transport for non-production environments
if (process.env['NODE_ENV'] !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// Add console transport for production with limited output
if (process.env['NODE_ENV'] === 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      level: 'warn', // Only warnings and errors in production console
    })
  );
}

// Logger utility methods
export const loggerUtils = {
  /**
   * Log HTTP request
   */
  logRequest: (req: Request, res: Response, responseTime?: number) => {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },

  /**
   * Log database operations
   */
  logDatabase: (
    operation: string,
    collection: string,
    duration?: number,
    error?: Error
  ) => {
    const logData = {
      operation,
      collection,
      duration: duration ? `${duration}ms` : undefined,
      error: error?.message,
    };

    if (error) {
      logger.error('Database Operation Failed', logData);
    } else {
      logger.debug('Database Operation', logData);
    }
  },

  /**
   * Log authentication events
   */
  logAuth: (
    event: string,
    userId?: string,
    email?: string,
    ip?: string,
    success = true
  ) => {
    const logData = {
      event,
      userId,
      email,
      ip,
      success,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      logger.info('Authentication Event', logData);
    } else {
      logger.warn('Authentication Failed', logData);
    }
  },

  /**
   * Log file operations
   */
  logFile: (
    operation: string,
    filename: string,
    size?: number,
    error?: Error
  ) => {
    const logData = {
      operation,
      filename,
      size: size ? `${size} bytes` : undefined,
      error: error?.message,
    };

    if (error) {
      logger.error('File Operation Failed', logData);
    } else {
      logger.info('File Operation', logData);
    }
  },

  /**
   * Log external API calls
   */
  logExternalAPI: (
    service: string,
    endpoint: string,
    method: string,
    statusCode?: number,
    duration?: number,
    error?: Error
  ) => {
    const logData = {
      service,
      endpoint,
      method,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      error: error?.message,
    };

    if (error || (statusCode && statusCode >= 400)) {
      logger.error('External API Call Failed', logData);
    } else {
      logger.info('External API Call', logData);
    }
  },
};

export { logger };

// Export default logger
export default logger;
