/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per IP
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for event tracking
 * 50 requests per 15 minutes per IP
 * (prevents spam event tracking)
 */
export const eventLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Too many events tracked. Please slow down.',
    },
});

/**
 * Loose rate limiter for read operations
 * 200 requests per 15 minutes per IP
 */
export const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});
