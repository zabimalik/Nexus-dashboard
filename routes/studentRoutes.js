import express from 'express';
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsByCourse
} from '../controllers/studentController.js';

const router = express.Router();

// @route   POST /api/students
// @desc    Create a new student
// @access  Public
router.post('/', createStudent);

// @route   GET /api/students
// @desc    Get all students
// @access  Public
router.get('/', getAllStudents);

// @route   GET /api/students/:id
// @desc    Get single student by ID
// @access  Public
router.get('/:id', getStudentById);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Public
router.put('/:id', updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Public
router.delete('/:id', deleteStudent);

// @route   GET /api/students/course/:courseId
// @desc    Get students by course
// @access  Public
router.get('/course/:courseId', getStudentsByCourse);

export default router;