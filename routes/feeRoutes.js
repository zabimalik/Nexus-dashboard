import express from 'express';
import {
    createFeeRecord,
    getAllFeeRecords,
    getFeeRecordById,
    updateFeeRecord,
    addPayment,
    deleteFeeRecord,
    getFeeRecordsByStudent,
    getFeeSummary,
    testFeeEndpoint
} from '../controllers/feeController.js';

const router = express.Router();

// @route   GET /api/fees/test
// @desc    Test fee API endpoint
// @access  Public
router.get('/test', testFeeEndpoint);

// @route   GET /api/fees/summary
// @desc    Get fee summary statistics
// @access  Public
router.get('/summary', getFeeSummary);

// @route   POST /api/fees
// @desc    Create a new fee record
// @access  Public
router.post('/', createFeeRecord);

// @route   GET /api/fees
// @desc    Get all fee records with pagination and filters
// @access  Public
router.get('/', getAllFeeRecords);

// @route   GET /api/fees/:id
// @desc    Get single fee record by ID
// @access  Public
router.get('/:id', getFeeRecordById);

// @route   PUT /api/fees/:id
// @desc    Update fee record
// @access  Public
router.put('/:id', updateFeeRecord);

// @route   POST /api/fees/:id/payment
// @desc    Add payment to fee record
// @access  Public
router.post('/:id/payment', addPayment);

// @route   DELETE /api/fees/:id
// @desc    Delete fee record
// @access  Public
router.delete('/:id', deleteFeeRecord);

// @route   GET /api/fees/student/:studentId
// @desc    Get fee records by student ID
// @access  Public
router.get('/student/:studentId', getFeeRecordsByStudent);

export default router;