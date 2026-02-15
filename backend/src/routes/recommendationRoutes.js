import express from 'express';
import axios from 'axios';
import { config } from '../config/config.js';
import { readLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// TEMPORARILY DISABLED for testing - will re-enable after verification
// Apply more lenient rate limiting for read operations
// 200 requests per 15 minutes (vs 100 for general API)
// router.use(readLimiter);

const ML_SERVICE_URL = config.mlService?.url || 'http://localhost:8000';

/**
 * GET /api/recommendations/:userId
 * Get personalized recommendations for a user
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { n = 10 } = req.query;

        // Forward request to ML service
        const response = await axios.get(
            `${ML_SERVICE_URL}/recommendations/${userId}?n=${n}`
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Failed to fetch recommendations',
            error: error.message,
        });
    }
});

/**
 * GET /api/model/info
 * Get ML model information
 */
router.get('/model/info', async (req, res) => {
    try {
        const response = await axios.get(
            `${ML_SERVICE_URL}/recommendations/model/info`
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching model info:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: 'Failed to fetch model info',
            error: error.message,
        });
    }
});

export default router;
