import BudgetRecord from '../models/budgetRecord.js';
import FeeRecord from '../models/feeRecord.js';
import SalaryRecord from '../models/salaryRecord.js';
import mongoose from 'mongoose';

// @desc    Get budget overview with real data
// @route   GET /api/budget/overview
// @access  Public
export const getBudgetOverview = async (req, res) => {
    try {
        const { startDate, endDate, months = 6 } = req.query;
        
        // Calculate date range
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to last 6 months
            const monthsBack = parseInt(months) || 6;
            const startOfPeriod = new Date();
            startOfPeriod.setMonth(startOfPeriod.getMonth() - monthsBack);
            startOfPeriod.setDate(1);
            startOfPeriod.setHours(0, 0, 0, 0);
            
            dateFilter = {
                date: { $gte: startOfPeriod }
            };
        }

        // Get real revenue from fee collections (using createdAt as payment date if paymentDate not available)
        const feeCollections = await FeeRecord.aggregate([
            {
                $match: {
                    amountPaid: { $gt: 0 }
                }
            },
            {
                $addFields: {
                    effectiveDate: {
                        $ifNull: ['$paymentDate', '$createdAt']
                    }
                }
            },
            {
                $match: {
                    effectiveDate: dateFilter.date || { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$effectiveDate' },
                        year: { $year: '$effectiveDate' }
                    },
                    totalRevenue: { $sum: '$amountPaid' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get real expenses from salary payments (using createdAt as payment date if paymentDate not available)
        const salaryPayments = await SalaryRecord.aggregate([
            {
                $match: {
                    amountPaid: { $gt: 0 }
                }
            },
            {
                $addFields: {
                    effectiveDate: {
                        $ifNull: ['$paymentDate', '$createdAt']
                    }
                }
            },
            {
                $match: {
                    effectiveDate: dateFilter.date || { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$effectiveDate' },
                        year: { $year: '$effectiveDate' }
                    },
                    totalSalaryExpense: { $sum: '$amountPaid' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get manual budget records
        const manualRecords = await BudgetRecord.aggregate([
            {
                $match: {
                    sourceType: 'manual',
                    date: dateFilter.date || { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' },
                        category: '$category'
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Generate monthly summary for the last 6 months
        const monthlyData = [];
        const now = new Date();
        
        for (let i = parseInt(months) - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const monthName = date.toLocaleString('default', { month: 'long' });
            
            // Calculate revenue for this month
            const feeRevenue = feeCollections.find(f => 
                f._id.month === month && f._id.year === year
            )?.totalRevenue || 0;
            
            const manualIncome = manualRecords
                .filter(r => r._id.month === month && r._id.year === year && r._id.category === 'income')
                .reduce((sum, r) => sum + r.totalAmount, 0);
            
            const totalIncome = feeRevenue + manualIncome;
            
            // Calculate expenses for this month
            const salaryExpense = salaryPayments.find(s => 
                s._id.month === month && s._id.year === year
            )?.totalSalaryExpense || 0;
            
            const manualExpenses = manualRecords
                .filter(r => r._id.month === month && r._id.year === year && r._id.category === 'expense')
                .reduce((sum, r) => sum + r.totalAmount, 0);
            
            const totalExpenses = salaryExpense + manualExpenses;
            
            monthlyData.push({
                month: monthName,
                year,
                income: totalIncome,
                expenses: totalExpenses,
                profit: totalIncome - totalExpenses,
                feeRevenue,
                salaryExpense,
                manualIncome,
                manualExpenses
            });
        }

        // Calculate overall totals directly from database
        const totalFeeIncome = await FeeRecord.aggregate([
            { $match: { amountPaid: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);

        const totalSalaryExpenseData = await SalaryRecord.aggregate([
            { $match: { amountPaid: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);

        const totalManualIncome = await BudgetRecord.aggregate([
            { $match: { category: 'income', sourceType: 'manual' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalManualExpenses = await BudgetRecord.aggregate([
            { $match: { category: 'expense', sourceType: 'manual' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalIncome = (totalFeeIncome[0]?.total || 0) + (totalManualIncome[0]?.total || 0);
        const totalExpenses = (totalSalaryExpenseData[0]?.total || 0) + (totalManualExpenses[0]?.total || 0);
        const netProfit = totalIncome - totalExpenses;

        // Get breakdown by category
        const expenseBreakdown = await BudgetRecord.aggregate([
            {
                $match: {
                    category: 'expense',
                    date: dateFilter.date || { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Add salary expenses to breakdown
        const totalSalaryExpense = salaryPayments.reduce((sum, s) => sum + s.totalSalaryExpense, 0);
        if (totalSalaryExpense > 0) {
            expenseBreakdown.unshift({
                _id: 'Salary',
                totalAmount: totalSalaryExpense,
                count: salaryPayments.reduce((sum, s) => sum + s.count, 0)
            });
        }

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalIncome,
                    totalExpenses,
                    netProfit,
                    profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
                },
                monthlyData,
                expenseBreakdown,
                period: {
                    months: parseInt(months),
                    startDate: dateFilter.date?.$gte || new Date(now.getFullYear(), now.getMonth() - parseInt(months) + 1, 1),
                    endDate: dateFilter.date?.$lte || now
                }
            }
        });

    } catch (error) {
        console.error('Error fetching budget overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch budget overview',
            error: error.message
        });
    }
};

// @desc    Get all budget records
// @route   GET /api/budget/records
// @access  Public
export const getBudgetRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = {};
        
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        if (req.query.type) {
            filter.type = req.query.type;
        }
        
        if (req.query.month && req.query.year) {
            filter.month = req.query.month;
            filter.year = parseInt(req.query.year);
        }

        const records = await BudgetRecord.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const totalRecords = await BudgetRecord.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            data: records,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching budget records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch budget records',
            error: error.message
        });
    }
};

// @desc    Create new budget record
// @route   POST /api/budget/records
// @access  Public
export const createBudgetRecord = async (req, res) => {
    try {
        const {
            type,
            description,
            amount,
            date,
            category
        } = req.body;

        // Validate required fields
        if (!type || !description || !amount || !category) {
            return res.status(400).json({
                success: false,
                message: 'Type, description, amount, and category are required'
            });
        }

        const recordDate = new Date(date || Date.now());
        const month = recordDate.toLocaleString('default', { month: 'long' });
        const year = recordDate.getFullYear();

        const budgetRecord = await BudgetRecord.create({
            type,
            description,
            amount: parseFloat(amount),
            date: recordDate,
            category,
            month,
            year,
            sourceType: 'manual',
            isSystemGenerated: false
        });

        res.status(201).json({
            success: true,
            message: 'Budget record created successfully',
            data: budgetRecord
        });

    } catch (error) {
        console.error('Error creating budget record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create budget record',
            error: error.message
        });
    }
};

// @desc    Update budget record
// @route   PUT /api/budget/records/:id
// @access  Public
export const updateBudgetRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description, amount, date, category } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid budget record ID'
            });
        }

        const budgetRecord = await BudgetRecord.findById(id);

        if (!budgetRecord) {
            return res.status(404).json({
                success: false,
                message: 'Budget record not found'
            });
        }

        // Don't allow editing system-generated records
        if (budgetRecord.isSystemGenerated) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit system-generated budget records'
            });
        }

        const recordDate = new Date(date || budgetRecord.date);
        const month = recordDate.toLocaleString('default', { month: 'long' });
        const year = recordDate.getFullYear();

        const updatedRecord = await BudgetRecord.findByIdAndUpdate(
            id,
            {
                type: type || budgetRecord.type,
                description: description || budgetRecord.description,
                amount: amount !== undefined ? parseFloat(amount) : budgetRecord.amount,
                date: recordDate,
                category: category || budgetRecord.category,
                month,
                year
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Budget record updated successfully',
            data: updatedRecord
        });

    } catch (error) {
        console.error('Error updating budget record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update budget record',
            error: error.message
        });
    }
};

// @desc    Delete budget record
// @route   DELETE /api/budget/records/:id
// @access  Public
export const deleteBudgetRecord = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid budget record ID'
            });
        }

        const budgetRecord = await BudgetRecord.findById(id);

        if (!budgetRecord) {
            return res.status(404).json({
                success: false,
                message: 'Budget record not found'
            });
        }

        // Don't allow deleting system-generated records
        if (budgetRecord.isSystemGenerated) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete system-generated budget records'
            });
        }

        await BudgetRecord.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Budget record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting budget record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete budget record',
            error: error.message
        });
    }
};

// @desc    Sync budget records with fee and salary data
// @route   POST /api/budget/sync
// @access  Public
export const syncBudgetData = async (req, res) => {
    try {
        let syncedRecords = 0;

        // Sync fee collections as income
        const feeRecords = await FeeRecord.find({
            amountPaid: { $gt: 0 },
            paymentDate: { $exists: true }
        });

        for (const feeRecord of feeRecords) {
            const existingRecord = await BudgetRecord.findOne({
                sourceType: 'fee_collection',
                sourceId: feeRecord._id
            });

            if (!existingRecord) {
                const paymentDate = new Date(feeRecord.paymentDate);
                const month = paymentDate.toLocaleString('default', { month: 'long' });
                const year = paymentDate.getFullYear();

                await BudgetRecord.create({
                    type: 'Other',
                    description: `Fee collection - ${feeRecord.studentName}`,
                    amount: feeRecord.amountPaid,
                    date: paymentDate,
                    category: 'income',
                    month,
                    year,
                    sourceType: 'fee_collection',
                    sourceId: feeRecord._id,
                    isSystemGenerated: true
                });

                syncedRecords++;
            }
        }

        // Sync salary payments as expenses
        const salaryRecords = await SalaryRecord.find({
            amountPaid: { $gt: 0 },
            paymentDate: { $exists: true }
        });

        for (const salaryRecord of salaryRecords) {
            const existingRecord = await BudgetRecord.findOne({
                sourceType: 'salary_payment',
                sourceId: salaryRecord._id
            });

            if (!existingRecord) {
                const paymentDate = new Date(salaryRecord.paymentDate);
                const month = paymentDate.toLocaleString('default', { month: 'long' });
                const year = paymentDate.getFullYear();

                await BudgetRecord.create({
                    type: 'Salary',
                    description: `Salary payment - ${salaryRecord.teacherName}`,
                    amount: salaryRecord.amountPaid,
                    date: paymentDate,
                    category: 'expense',
                    month,
                    year,
                    sourceType: 'salary_payment',
                    sourceId: salaryRecord._id,
                    isSystemGenerated: true
                });

                syncedRecords++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully synced ${syncedRecords} budget records`,
            data: { syncedRecords }
        });

    } catch (error) {
        console.error('Error syncing budget data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync budget data',
            error: error.message
        });
    }
};