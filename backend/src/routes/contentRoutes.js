/**
 * Content Routes
 * Defines all content-related API endpoints
 */

import express from 'express';
import {
    createContent,
    getContent,
    getAllContent,
    updateContent,
    deleteContent
} from '../controllers/contentController.js';

const router = express.Router();

/**
 * @route   POST /api/content
 * @desc    Create new content
 * @access  Public
 */
router.post('/', createContent);

/**
 * @route   GET /api/content
 * @desc    Get all content (with pagination, category filter, search)
 * @access  Public
 * @query   limit, offset, category, search
 */
router.get('/', getAllContent);

/**
 * @route   GET /api/content/:id
 * @desc    Get content by ID
 * @access  Public
 */
router.get('/:id', getContent);

/**
 * @route   PUT /api/content/:id
 * @desc    Update content
 * @access  Public
 */
router.put('/:id', updateContent);

/**
 * @route   DELETE /api/content/:id
 * @desc    Delete content
 * @access  Public
 */
router.delete('/:id', deleteContent);

export default router;
