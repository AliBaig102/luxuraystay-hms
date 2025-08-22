import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils';

// Load environment variables
dotenv.config();

const PROJECT_VERSION = process.env.PROJECT_VERSION || 'v1';
const PROJECT_NAME = process.env.PROJECT_NAME || 'LuxuryStay HMS';
const PORT = process.env.PORT || 4000;

/**
 * Create and configure the Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: true,
      timestamp: new Date().toISOString(),
      message: `${PROJECT_NAME} API is running`,
      version: PROJECT_VERSION,
      environment: process.env.NODE_ENV || 'development',
    });
  });

  return app;
}

/**
 * Start the server
 */
export function startServer(app: express.Application, _port?: number): void {
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

/**
 * Get the configured Express application
 */
export const app = createApp();
