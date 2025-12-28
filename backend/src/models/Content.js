/**
 * Content Model
 * Handles all database operations related to content items
 */

import { pool } from '../config/database.js';

export class Content {
    /**
     * Create new content
     * @param {string} title - Content title
     * @param {string} category - Content category
     * @param {Array} tags - Array of tags
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Created content
     */
    static async create({ title, category, tags = [], metadata = {} }) {
        try {
            const result = await pool.query(
                `INSERT INTO content (title, category, tags, metadata) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                [title, category, tags, JSON.stringify(metadata)]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating content:', error);
            throw error;
        }
    }

    /**
     * Find content by ID
     * @param {string} id - Content UUID
     * @returns {Object|null} Content object or null
     */
    static async findById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM content WHERE id = $1',
                [id]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding content:', error);
            throw error;
        }
    }

    /**
     * Get all content with pagination
     * @param {number} limit - Maximum items to return
     * @param {number} offset - Number of items to skip
     * @returns {Array} Array of content objects
     */
    static async findAll(limit = 50, offset = 0) {
        try {
            const result = await pool.query(
                `SELECT * FROM content 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching content:', error);
            throw error;
        }
    }

    /**
     * Find content by category
     * @param {string} category - Category name
     * @param {number} limit - Maximum items to return
     * @returns {Array} Array of content objects
     */
    static async findByCategory(category, limit = 50) {
        try {
            const result = await pool.query(
                `SELECT * FROM content 
         WHERE category = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
                [category, limit]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching content by category:', error);
            throw error;
        }
    }

    /**
     * Search content by title or tags
     * @param {string} query - Search query
     * @param {number} limit - Maximum items to return
     * @returns {Array} Array of matching content
     */
    static async search(query, limit = 50) {
        try {
            const result = await pool.query(
                `SELECT * FROM content 
         WHERE title ILIKE $1 
         OR $2 = ANY(tags)
         ORDER BY created_at DESC 
         LIMIT $3`,
                [`%${query}%`, query, limit]
            );

            return result.rows;
        } catch (error) {
            console.error('Error searching content:', error);
            throw error;
        }
    }

    /**
     * Get total content count
     * @returns {number} Total content count
     */
    static async count() {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM content');
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error counting content:', error);
            throw error;
        }
    }

    /**
     * Update content
     * @param {string} id - Content UUID
     * @param {Object} data - Updated fields
     * @returns {Object|null} Updated content or null
     */
    static async update(id, { title, category, tags, metadata }) {
        try {
            const result = await pool.query(
                `UPDATE content 
         SET title = COALESCE($1, title),
             category = COALESCE($2, category),
             tags = COALESCE($3, tags),
             metadata = COALESCE($4, metadata)
         WHERE id = $5 
         RETURNING *`,
                [title, category, tags, metadata ? JSON.stringify(metadata) : null, id]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating content:', error);
            throw error;
        }
    }

    /**
     * Delete content
     * @param {string} id - Content UUID
     * @returns {boolean} True if deleted
     */
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM content WHERE id = $1 RETURNING id',
                [id]
            );

            return result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting content:', error);
            throw error;
        }
    }
}
