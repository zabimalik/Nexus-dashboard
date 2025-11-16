import express from 'express';
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsByCourse,
    getPendingCertificates,
    getCertificateSummary,
    updateCertificateStatus
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

// @route   GET /api/students/pending-certificates
// @desc    Get students with pending certificates
// @access  Public
router.get('/pending-certificates', getPendingCertificates);

// @route   GET /api/students/pending-certificates/summary
// @desc    Get certificate summary statistics
// @access  Public
router.get('/pending-certificates/summary', getCertificateSummary);

// @route   PUT /api/students/pending-certificates/:id/status
// @desc    Update certificate status
// @access  Public
router.put('/pending-certificates/:id/status', updateCertificateStatus);

// @route   GET /api/students/course/:courseId
// @desc    Get students by course
// @access  Public
router.get('/course/:courseId', getStudentsByCourse);

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

export default router;