/**
 * Interaction Model
 * Handles all database operations related to user interactions/events
 * This data is used to train the ML recommendation model
 */

import { pool } from '../config/database.js';

export class Interaction {
    /**
     * Create new interaction event
     * @param {string} userId - User UUID
     * @param {string} contentId - Content UUID
     * @param {string} eventType - Event type (view, like, rating, click)
     * @param {number} value - Optional value (for ratings: 1-5)
     * @returns {Object} Created interaction
     */
    static async create({ userId, contentId, eventType, value = null }) {
        try {
            const result = await pool.query(
                `INSERT INTO interactions (user_id, content_id, event_type, value) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                [userId, contentId, eventType, value]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating interaction:', error);
            throw error;
        }
    }

    /**
     * Get user's interaction history
     * @param {string} userId - User UUID
     * @param {number} limit - Maximum events to return
     * @returns {Array} Array of interaction events
     */
    static async findByUser(userId, limit = 100) {
        try {
            const result = await pool.query(
                `SELECT i.*, c.title as content_title, c.category 
         FROM interactions i
         JOIN content c ON i.content_id = c.id
         WHERE i.user_id = $1 
         ORDER BY i.created_at DESC 
         LIMIT $2`,
                [userId, limit]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching user interactions:', error);
            throw error;
        }
    }

    /**
     * Get content's interaction history
     * @param {string} contentId - Content UUID
     * @param {number} limit - Maximum events to return
     * @returns {Array} Array of interaction events
     */
    static async findByContent(contentId, limit = 100) {
        try {
            const result = await pool.query(
                `SELECT i.*, u.metadata as user_metadata
         FROM interactions i
         JOIN users u ON i.user_id = u.id
         WHERE i.content_id = $1 
         ORDER BY i.created_at DESC 
         LIMIT $2`,
                [contentId, limit]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching content interactions:', error);
            throw error;
        }
    }

    /**
     * Get interactions by event type
     * @param {string} eventType - Event type (view, like, rating, click)
     * @param {number} limit - Maximum events to return
     * @returns {Array} Array of interactions
     */
    static async findByType(eventType, limit = 100) {
        try {
            const result = await pool.query(
                `SELECT i.*, c.title as content_title, c.category 
         FROM interactions i
         JOIN content c ON i.content_id = c.id
         WHERE i.event_type = $1 
         ORDER BY i.created_at DESC 
         LIMIT $2`,
                [eventType, limit]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching interactions by type:', error);
            throw error;
        }
    }

    /**
     * Get user's rating for specific content
     * @param {string} userId - User UUID
     * @param {string} contentId - Content UUID
     * @returns {Object|null} Rating interaction or null
     */
    static async getUserContentRating(userId, contentId) {
        try {
            const result = await pool.query(
                `SELECT * FROM interactions 
         WHERE user_id = $1 
         AND content_id = $2 
         AND event_type = 'rating'
         ORDER BY created_at DESC 
         LIMIT 1`,
                [userId, contentId]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching user rating:', error);
            throw error;
        }
    }

    /**
     * Get interaction statistics for content
     * @param {string} contentId - Content UUID
     * @returns {Object} Stats (views, likes, avg rating, etc.)
     */
    static async getContentStats(contentId) {
        try {
            const result = await pool.query(
                `SELECT 
          COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
          COUNT(CASE WHEN event_type = 'like' THEN 1 END) as likes,
          COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
          COUNT(CASE WHEN event_type = 'rating' THEN 1 END) as rating_count,
          ROUND(AVG(CASE WHEN event_type = 'rating' THEN value END), 2) as avg_rating
         FROM interactions 
         WHERE content_id = $1`,
                [contentId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error fetching content stats:', error);
            throw error;
        }
    }

    /**
     * Get total interaction count
     * @returns {number} Total interactions
     */
    static async count() {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM interactions');
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error counting interactions:', error);
            throw error;
        }
    }

    /**
     * Delete interaction
     * @param {string} id - Interaction UUID
     * @returns {boolean} True if deleted
     */
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM interactions WHERE id = $1 RETURNING id',
                [id]
            );

            return result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting interaction:', error);
            throw error;
        }
    }
}
