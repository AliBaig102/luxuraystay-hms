import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import { logger } from './utils';
import {
  generalLimiter,
  healthCheckLimiter,
  databaseConnection,
} from './config';
import {
  testRoutes,
  roomRoutes,
  userRoutes,
  reservationRoutes,
  billRoutes,
} from './routes';

const PROJECT_VERSION = process.env.PROJECT_VERSION || 'v1';
const PROJECT_NAME = process.env.PROJECT_NAME || 'LuxuryStay HMS';
const PORT = process.env.PORT || 4000;

/**
 * Create and configure the Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Security and basic middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply global rate limiting to all routes
  app.use(generalLimiter);

  // Endpoints
  app.use(`/api/${PROJECT_VERSION}/tests`, testRoutes);
  app.use(`/api/${PROJECT_VERSION}/users`, userRoutes);
  app.use(`/api/${PROJECT_VERSION}/rooms`, roomRoutes);
  app.use(`/api/${PROJECT_VERSION}/reservations`, reservationRoutes);
  app.use(`/api/${PROJECT_VERSION}/bills`, billRoutes);

  // Health check endpoint with specific rate limiting
  app.get('/health', healthCheckLimiter, (req, res) => {
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
export async function startServer(
  app: express.Application,
  _port?: number
): Promise<void> {
  try {
    // Initialize database connection
    await databaseConnection.connect();

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🗄️  Database: Connected`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Get the configured Express application
 */
export const app = createApp();
