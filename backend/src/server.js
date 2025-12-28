import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import pool from './config/database.js';
import redis from './services/redisService.js';

const app = express();

// Import middleware
import { apiLimiter } from './middleware/rateLimiter.js';

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger
app.use('/api/', apiLimiter); // Rate limiting for all API routes

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await pool.query('SELECT 1');

        // Check Redis connection
        await redis.ping();

        res.json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected',
            },
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Service unhealthy',
            error: error.message,
        });
    }
});

// Import routes
import userRoutes from './routes/userRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/events', eventRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`

Recommendation System Backend    
Server: http://localhost:${PORT}   
Environment: ${config.nodeEnv}        

  `);
});

export default app;
