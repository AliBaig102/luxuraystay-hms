import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
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
  checkInRoutes,
  checkOutRoutes,
  serviceRequestRoutes,
  housekeepingTaskRoutes,
  maintenanceRequestRoutes,
  feedbackRoutes,
  notificationRoutes,
  reportRoutes,
  inventoryRoutes,
} from './routes';
import WebSocketService from './services/websocket.service';
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
  app.use(`/api/${PROJECT_VERSION}/checkins`, checkInRoutes);
  app.use(`/api/${PROJECT_VERSION}/checkouts`, checkOutRoutes);
  app.use(`/api/${PROJECT_VERSION}/service-requests`, serviceRequestRoutes);
  app.use(`/api/${PROJECT_VERSION}/housekeeping-tasks`, housekeepingTaskRoutes);
  app.use(
    `/api/${PROJECT_VERSION}/maintenance-requests`,
    maintenanceRequestRoutes
  );
  app.use(`/api/${PROJECT_VERSION}/feedback`, feedbackRoutes);
  app.use(`/api/${PROJECT_VERSION}/notifications`, notificationRoutes);
  app.use(`/api/${PROJECT_VERSION}/reports`, reportRoutes);
  app.use(`/api/${PROJECT_VERSION}/inventory`, inventoryRoutes);

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

    // Create HTTP server
    const server = createServer(app);

    // Initialize WebSocket service
    const webSocketService = new WebSocketService(server);

    // Store WebSocket service globally for use in other parts of the application
    (global as any).webSocketService = webSocketService;

    server.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔌 WebSocket: Initialized`);
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
