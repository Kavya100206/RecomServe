/**
 * Event Controller
 * Handles HTTP requests for event tracking endpoints
 * Events are user interactions: views, likes, ratings, clicks
 */

import { Interaction } from '../models/Interaction.js';
import { User } from '../models/User.js';
import { Content } from '../models/Content.js';

/**
 * Track new event
 * POST /api/events
 */
export const trackEvent = async (req, res) => {
    try {
        const { userId, contentId, eventType, value } = req.body;

        // Validate required fields
        if (!userId || !contentId || !eventType) {
            return res.status(400).json({
                success: false,
                message: 'userId, contentId, and eventType are required'
            });
        }

        // Validate event type
        const validTypes = ['view', 'like', 'rating', 'click'];
        if (!validTypes.includes(eventType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid event type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // Validate rating value
        if (eventType === 'rating') {
            if (!value || value < 1 || value > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating value must be between 1 and 5'
                });
            }
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify content exists
        const content = await Content.findById(contentId);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Create interaction
        const interaction = await Interaction.create({
            userId,
            contentId,
            eventType,
            value
        });

        res.status(201).json({
            success: true,
            data: interaction,
            message: 'Event tracked successfully'
        });

    } catch (error) {
        console.error('Track event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track event',
            error: error.message
        });
    }
};

/**
 * Get user's interaction history
 * GET /api/events/user/:userId
 */
export const getUserEvents = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const events = await Interaction.findByUser(userId, limit);

        res.status(200).json({
            success: true,
            data: events,
            count: events.length
        });

    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user events',
            error: error.message
        });
    }
};

/**
 * Get content's interaction history
 * GET /api/events/content/:contentId
 */
export const getContentEvents = async (req, res) => {
    try {
        const { contentId } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const events = await Interaction.findByContent(contentId, limit);

        res.status(200).json({
            success: true,
            data: events,
            count: events.length
        });

    } catch (error) {
        console.error('Get content events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content events',
            error: error.message
        });
    }
};

/**
 * Get content statistics
 * GET /api/events/stats/:contentId
 */
export const getContentStats = async (req, res) => {
    try {
        const { contentId } = req.params;

        // Verify content exists
        const content = await Content.findById(contentId);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        const stats = await Interaction.getContentStats(contentId);

        res.status(200).json({
            success: true,
            data: {
                content_id: contentId,
                content_title: content.title,
                ...stats
            }
        });

    } catch (error) {
        console.error('Get content stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content stats',
            error: error.message
        });
    }
};

/**
 * Get events by type
 * GET /api/events/type/:eventType
 */
export const getEventsByType = async (req, res) => {
    try {
        const { eventType } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const events = await Interaction.findByType(eventType, limit);

        res.status(200).json({
            success: true,
            data: events,
            count: events.length
        });

    } catch (error) {
        console.error('Get events by type error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};
