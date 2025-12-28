/**
 * Content Controller
 * Handles HTTP requests for content management endpoints
 */

import { Content } from '../models/Content.js';

/**
 * Create new content
 * POST /api/content
 */
export const createContent = async (req, res) => {
    try {
        const { title, category, tags, metadata } = req.body;

        // Validate required fields
        if (!title || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title and category are required'
            });
        }

        const content = await Content.create({ title, category, tags, metadata });

        res.status(201).json({
            success: true,
            data: content,
            message: 'Content created successfully'
        });

    } catch (error) {
        console.error('Create content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create content',
            error: error.message
        });
    }
};

/**
 * Get content by ID
 * GET /api/content/:id
 */
export const getContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            data: content
        });

    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content',
            error: error.message
        });
    }
};

/**
 * Get all content with filters
 * GET /api/content?limit=50&offset=0&category=technology&search=ML
 */
export const getAllContent = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const { category, search } = req.query;

        // Validate pagination
        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 100'
            });
        }

        let contentList;
        let total;

        // Filter by category
        if (category) {
            contentList = await Content.findByCategory(category, limit);
            total = contentList.length;
        }
        // Search by query
        else if (search) {
            contentList = await Content.search(search, limit);
            total = contentList.length;
        }
        // Get all
        else {
            contentList = await Content.findAll(limit, offset);
            total = await Content.count();
        }

        res.status(200).json({
            success: true,
            data: contentList,
            pagination: {
                total,
                limit,
                offset,
                count: contentList.length
            }
        });

    } catch (error) {
        console.error('Get all content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch content',
            error: error.message
        });
    }
};

/**
 * Update content
 * PUT /api/content/:id
 */
export const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, tags, metadata } = req.body;

        const content = await Content.update(id, { title, category, tags, metadata });

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            data: content,
            message: 'Content updated successfully'
        });

    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update content',
            error: error.message
        });
    }
};

/**
 * Delete content
 * DELETE /api/content/:id
 */
export const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Content.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully'
        });

    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete content',
            error: error.message
        });
    }
};
