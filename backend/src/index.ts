import { app, startServer } from './server';

// Start the server
startServer(app).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
