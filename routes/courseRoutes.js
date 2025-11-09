import express from 'express';
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    testCourseEndpoint
} from '../controllers/courseController.js';

const router = express.Router();

// @route   GET /api/courses/test
// @desc    Test course API endpoint
// @access  Public
router.get('/test', testCourseEndpoint);

// @route   POST /api/courses
// @desc    Create a new course
// @access  Public
router.post('/', createCourse);

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', getAllCourses);

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get('/:id', getCourseById);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Public
router.put('/:id', updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Public
router.delete('/:id', deleteCourse);

export default router;