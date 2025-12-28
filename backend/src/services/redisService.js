import Redis from 'ioredis';
import { config } from '../config/config.js';

// Create Redis client
const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

/**
 * Cache helper functions
 */
export const redisService = {
    /**
     * Get value from cache
     */
    async get(key) {
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    },

    /**
     * Set value in cache with TTL (Time To Live)
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - TTL in seconds (default: 3600 = 1 hour)
     */
    async set(key, value, ttl = 3600) {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Redis SET error:', error);
            return false;
        }
    },

    /**
     * Delete cache key
     */
    async del(key) {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    },

    /**
     * Check if key exists
     */
    async exists(key) {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    },
};

export default redis;
