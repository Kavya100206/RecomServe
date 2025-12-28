/**
 * Event Routes
 * Defines all event tracking API endpoints
 */

import express from 'express';
import {
    trackEvent,
    getUserEvents,
    getContentEvents,
    getContentStats,
    getEventsByType
} from '../controllers/eventController.js';

const router = express.Router();

/**
 * @route   POST /api/events
 * @desc    Track a new event (view, like, rating, click)
 * @access  Public
 * @body    { userId, contentId, eventType, value? }
 */
router.post('/', trackEvent);

/**
 * @route   GET /api/events/user/:userId
 * @desc    Get user's interaction history
 * @access  Public
 * @query   limit (default: 100)
 */
router.get('/user/:userId', getUserEvents);

/**
 * @route   GET /api/events/content/:contentId
 * @desc    Get content's interaction history
 * @access  Public
 * @query   limit (default: 100)
 */
router.get('/content/:contentId', getContentEvents);

/**
 * @route   GET /api/events/stats/:contentId
 * @desc    Get content statistics (views, likes, avg rating)
 * @access  Public
 */
router.get('/stats/:contentId', getContentStats);

/**
 * @route   GET /api/events/type/:eventType
 * @desc    Get events by type (view, like, rating, click)
 * @access  Public
 * @query   limit (default: 100)
 */
router.get('/type/:eventType', getEventsByType);

export default router;
