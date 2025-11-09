import express from 'express';
import {
    getSalaryRecords,
    getSalaryRecord,
    createSalaryRecord,
    updateSalaryRecord,
    deleteSalaryRecord,
    getSalarySummary
} from '../controllers/salaryController.js';

const router = express.Router();

// @route   GET /api/salaries/summary
// @desc    Get salary summary statistics
// @access  Public
router.get('/summary', getSalarySummary);

// @route   GET /api/salaries
// @desc    Get all salary records with pagination and filtering
// @access  Public
router.get('/', getSalaryRecords);

// @route   GET /api/salaries/:id
// @desc    Get single salary record by ID
// @access  Public
router.get('/:id', getSalaryRecord);

// @route   POST /api/salaries
// @desc    Create new salary record
// @access  Public
router.post('/', createSalaryRecord);

// @route   PUT /api/salaries/:id
// @desc    Update salary record
// @access  Public
router.put('/:id', updateSalaryRecord);

// @route   DELETE /api/salaries/:id
// @desc    Delete salary record
// @access  Public
router.delete('/:id', deleteSalaryRecord);

export default router;