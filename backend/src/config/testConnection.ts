import dotenv from 'dotenv';
import { databaseConnection } from './database';
import { logger } from '../utils';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    logger.info('Testing MongoDB connection...');

    // Test connection
    await databaseConnection.connect();

    logger.info('✅ Connection test successful!');

    // Test disconnection
    await databaseConnection.disconnect();

    logger.info('✅ Disconnection test successful!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
void testConnection();
