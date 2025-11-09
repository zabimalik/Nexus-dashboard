import express from 'express';
import {
    getBudgetOverview,
    getBudgetRecords,
    createBudgetRecord,
    updateBudgetRecord,
    deleteBudgetRecord,
    syncBudgetData
} from '../controllers/budgetController.js';

const router = express.Router();

// @route   GET /api/budget/overview
// @desc    Get budget overview with real data
// @access  Public
router.get('/overview', getBudgetOverview);

// @route   POST /api/budget/sync
// @desc    Sync budget records with fee and salary data
// @access  Public
router.post('/sync', syncBudgetData);

// @route   GET /api/budget/records
// @desc    Get all budget records with pagination and filtering
// @access  Public
router.get('/records', getBudgetRecords);

// @route   POST /api/budget/records
// @desc    Create new budget record
// @access  Public
router.post('/records', createBudgetRecord);

// @route   PUT /api/budget/records/:id
// @desc    Update budget record
// @access  Public
router.put('/records/:id', updateBudgetRecord);

// @route   DELETE /api/budget/records/:id
// @desc    Delete budget record
// @access  Public
router.delete('/records/:id', deleteBudgetRecord);

export default router;