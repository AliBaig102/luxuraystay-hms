import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/server';
import { databaseConnection } from '../src/config';

// Initialize the Express app
const app = createApp();

// Initialize database connection for serverless
let isConnected = false;

async function connectToDatabase() {
  if (!isConnected) {
    try {
      await databaseConnection.connect();
      isConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
}

// Export the serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure database is connected
    await connectToDatabase();
    
    // Handle the request using Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process request'
    });
  }
}