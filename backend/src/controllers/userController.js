/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 */

import { User } from '../models/User.js';

/**
 * Create a new user
 * POST /api/users
 */
export const createUser = async (req, res) => {
    try {
        const { metadata } = req.body;

        // Create user in database
        const user = await User.create(metadata || {});

        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

/**
 * Get all users with pagination
 * GET /api/users?limit=50&offset=0
 */
export const getAllUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        // Validate pagination params
        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 100'
            });
        }

        const users = await User.findAll(limit, offset);
        const total = await User.count();

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                limit,
                offset,
                count: users.length
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

/**
 * Update user metadata
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { metadata } = req.body;

        if (!metadata) {
            return res.status(400).json({
                success: false,
                message: 'Metadata is required'
            });
        }

        const user = await User.update(id, metadata);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await User.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
