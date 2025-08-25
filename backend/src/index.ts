import { app, startServer } from './server';
import { logger } from './utils';

// Start the server
startServer(app).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
