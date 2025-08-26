import { app, startServer } from './server';
import { logger } from './utils';

// Start the server
logger.info('Starting application...');
startServer(app)
  .then(() => {
    logger.info('Server started successfully');
  })
  .catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

export default app;
