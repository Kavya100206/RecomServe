/**
 * User Model
 * Handles all database operations related to users
 */

import { pool } from '../config/database.js';

export class User {
    /**
     * Create a new user
     * @param {Object} metadata - User metadata (preferences, demographics, etc.)
     * @returns {Object} Created user with id, metadata, and created_at
     */
    static async create(metadata = {}) {
        try {
            const result = await pool.query(
                `INSERT INTO users (metadata) 
         VALUES ($1) 
         RETURNING *`,
                [JSON.stringify(metadata)]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     * @param {string} id - User UUID
     * @returns {Object|null} User object or null if not found
     */
    static async findById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE id = $1',
                [id]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    /**
     * Get all users with pagination
     * @param {number} limit - Maximum number of users to return
     * @param {number} offset - Number of users to skip
     * @returns {Array} Array of user objects
     */
    static async findAll(limit = 100, offset = 0) {
        try {
            const result = await pool.query(
                `SELECT * FROM users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            return result.rows;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    /**
     * Get total count of users
     * @returns {number} Total number of users
     */
    static async count() {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM users');
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }

    /**
     * Update user metadata
     * @param {string} id - User UUID
     * @param {Object} metadata - New metadata
     * @returns {Object|null} Updated user or null if not found
     */
    static async update(id, metadata) {
        try {
            const result = await pool.query(
                `UPDATE users 
         SET metadata = $1 
         WHERE id = $2 
         RETURNING *`,
                [JSON.stringify(metadata), id]
            );

            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete user by ID
     * @param {string} id - User UUID
     * @returns {boolean} True if deleted, false if not found
     */
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM users WHERE id = $1 RETURNING id',
                [id]
            );

            return result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}
