import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from config/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  // Server
  port: process.env.BACKEND_PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    connectionString: process.env.DATABASE_URL,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // ML Service
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  },
};
