import SalaryRecord from '../models/salaryRecord.js';
import Teacher from '../models/teacher.js';

// @desc    Get all salary records with pagination and filtering
// @route   GET /api/salaries
// @access  Public
export const getSalaryRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
        if (req.query.teacherId) {
            filter.teacherId = req.query.teacherId;
        }
        
        if (req.query.month) {
            filter.month = req.query.month;
        }
        
        if (req.query.year) {
            filter.year = parseInt(req.query.year);
        }
        
        if (req.query.paymentStatus) {
            filter.paymentStatus = req.query.paymentStatus;
        }
        
        // Get salary records with teacher population
        const salaryRecords = await SalaryRecord.find(filter)
            .populate('teacherId', 'name specialization joiningDate')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const totalRecords = await SalaryRecord.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limit);
        
        // Transform data for frontend
        const transformedRecords = salaryRecords.map(record => ({
            id: record._id,
            teacherId: record.teacherId._id,
            teacherName: record.teacherName,
            month: record.month,
            year: record.year,
            baseSalary: record.baseSalary,
            bonus: record.bonus,
            deductions: record.deductions,
            amountPaid: record.amountPaid,
            paymentStatus: record.paymentStatus,
            paymentDate: record.paymentDate ? record.paymentDate.toISOString().split('T')[0] : null,
            notes: record.notes,
            netPayable: record.netPayable,
            remainingAmount: record.remainingAmount,
            paymentPercentage: record.paymentPercentage,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            teacher: record.teacherId
        }));
        
        // Calculate summary statistics
        const allRecords = await SalaryRecord.find(filter);
        const summary = {
            totalPayable: allRecords.reduce((sum, record) => sum + record.netPayable, 0),
            totalPaid: allRecords.reduce((sum, record) => sum + record.amountPaid, 0),
            totalRemaining: allRecords.reduce((sum, record) => sum + record.remainingAmount, 0),
            totalRecords: allRecords.length,
            paidCount: allRecords.filter(record => record.paymentStatus === 'Paid').length,
            partialCount: allRecords.filter(record => record.paymentStatus === 'Partial').length,
            unpaidCount: allRecords.filter(record => record.paymentStatus === 'Unpaid').length
        };
        
        res.status(200).json({
            success: true,
            data: transformedRecords,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            summary
        });
    } catch (error) {
        console.error('Error fetching salary records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch salary records',
            error: error.message
        });
    }
};

// @desc    Get single salary record by ID
// @route   GET /api/salaries/:id
// @access  Public
export const getSalaryRecord = async (req, res) => {
    try {
        const salaryRecord = await SalaryRecord.findById(req.params.id)
            .populate('teacherId', 'name specialization joiningDate');
        
        if (!salaryRecord) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }
        
        const transformedRecord = {
            id: salaryRecord._id,
            teacherId: salaryRecord.teacherId._id,
            teacherName: salaryRecord.teacherName,
            month: salaryRecord.month,
            year: salaryRecord.year,
            baseSalary: salaryRecord.baseSalary,
            bonus: salaryRecord.bonus,
            deductions: salaryRecord.deductions,
            amountPaid: salaryRecord.amountPaid,
            paymentStatus: salaryRecord.paymentStatus,
            paymentDate: salaryRecord.paymentDate ? salaryRecord.paymentDate.toISOString().split('T')[0] : null,
            notes: salaryRecord.notes,
            netPayable: salaryRecord.netPayable,
            remainingAmount: salaryRecord.remainingAmount,
            paymentPercentage: salaryRecord.paymentPercentage,
            teacher: salaryRecord.teacherId
        };
        
        res.status(200).json({
            success: true,
            data: transformedRecord
        });
    } catch (error) {
        console.error('Error fetching salary record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch salary record',
            error: error.message
        });
    }
};

// @desc    Create new salary record
// @route   POST /api/salaries
// @access  Public
export const createSalaryRecord = async (req, res) => {
    try {
        const {
            teacherId,
            month,
            year,
            baseSalary,
            bonus = 0,
            deductions = 0,
            amountPaid = 0,
            paymentDate,
            notes
        } = req.body;
        
        // Validate required fields
        if (!teacherId || !month || !year || !baseSalary) {
            return res.status(400).json({
                success: false,
                message: 'Teacher ID, month, year, and base salary are required'
            });
        }
        
        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        
        // Check if salary record already exists for this teacher, month, and year
        const existingRecord = await SalaryRecord.findOne({
            teacherId,
            month,
            year
        });
        
        if (existingRecord) {
            return res.status(400).json({
                success: false,
                message: `Salary record already exists for ${teacher.name} for ${month} ${year}`
            });
        }
        
        // Create salary record
        const salaryRecord = await SalaryRecord.create({
            teacherId,
            teacherName: teacher.name,
            month,
            year,
            baseSalary,
            bonus,
            deductions,
            amountPaid,
            paymentDate: paymentDate ? new Date(paymentDate) : null,
            notes
        });
        
        // Populate teacher data
        await salaryRecord.populate('teacherId', 'name specialization joiningDate');
        
        const transformedRecord = {
            id: salaryRecord._id,
            teacherId: salaryRecord.teacherId._id,
            teacherName: salaryRecord.teacherName,
            month: salaryRecord.month,
            year: salaryRecord.year,
            baseSalary: salaryRecord.baseSalary,
            bonus: salaryRecord.bonus,
            deductions: salaryRecord.deductions,
            amountPaid: salaryRecord.amountPaid,
            paymentStatus: salaryRecord.paymentStatus,
            paymentDate: salaryRecord.paymentDate ? salaryRecord.paymentDate.toISOString().split('T')[0] : null,
            notes: salaryRecord.notes,
            netPayable: salaryRecord.netPayable,
            remainingAmount: salaryRecord.remainingAmount,
            paymentPercentage: salaryRecord.paymentPercentage,
            teacher: salaryRecord.teacherId
        };
        
        res.status(201).json({
            success: true,
            message: 'Salary record created successfully',
            data: transformedRecord
        });
    } catch (error) {
        console.error('Error creating salary record:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Salary record already exists for this teacher, month, and year'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create salary record',
            error: error.message
        });
    }
};

// @desc    Update salary record
// @route   PUT /api/salaries/:id
// @access  Public
export const updateSalaryRecord = async (req, res) => {
    try {
        const {
            baseSalary,
            bonus,
            deductions,
            amountPaid,
            paymentDate,
            notes
        } = req.body;
        
        const salaryRecord = await SalaryRecord.findById(req.params.id);
        
        if (!salaryRecord) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }
        
        // Update fields
        if (baseSalary !== undefined) salaryRecord.baseSalary = baseSalary;
        if (bonus !== undefined) salaryRecord.bonus = bonus;
        if (deductions !== undefined) salaryRecord.deductions = deductions;
        if (amountPaid !== undefined) salaryRecord.amountPaid = amountPaid;
        if (paymentDate !== undefined) {
            salaryRecord.paymentDate = paymentDate ? new Date(paymentDate) : null;
        }
        if (notes !== undefined) salaryRecord.notes = notes;
        
        await salaryRecord.save();
        
        // Populate teacher data
        await salaryRecord.populate('teacherId', 'name specialization joiningDate');
        
        const transformedRecord = {
            id: salaryRecord._id,
            teacherId: salaryRecord.teacherId._id,
            teacherName: salaryRecord.teacherName,
            month: salaryRecord.month,
            year: salaryRecord.year,
            baseSalary: salaryRecord.baseSalary,
            bonus: salaryRecord.bonus,
            deductions: salaryRecord.deductions,
            amountPaid: salaryRecord.amountPaid,
            paymentStatus: salaryRecord.paymentStatus,
            paymentDate: salaryRecord.paymentDate ? salaryRecord.paymentDate.toISOString().split('T')[0] : null,
            notes: salaryRecord.notes,
            netPayable: salaryRecord.netPayable,
            remainingAmount: salaryRecord.remainingAmount,
            paymentPercentage: salaryRecord.paymentPercentage,
            teacher: salaryRecord.teacherId
        };
        
        res.status(200).json({
            success: true,
            message: 'Salary record updated successfully',
            data: transformedRecord
        });
    } catch (error) {
        console.error('Error updating salary record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update salary record',
            error: error.message
        });
    }
};

// @desc    Delete salary record
// @route   DELETE /api/salaries/:id
// @access  Public
export const deleteSalaryRecord = async (req, res) => {
    try {
        const salaryRecord = await SalaryRecord.findById(req.params.id);
        
        if (!salaryRecord) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found'
            });
        }
        
        await SalaryRecord.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Salary record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting salary record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete salary record',
            error: error.message
        });
    }
};

// @desc    Get salary summary statistics
// @route   GET /api/salaries/summary
// @access  Public
export const getSalarySummary = async (req, res) => {
    try {
        // Build filter object
        const filter = {};
        
        if (req.query.month) {
            filter.month = req.query.month;
        }
        
        if (req.query.year) {
            filter.year = parseInt(req.query.year);
        }
        
        const records = await SalaryRecord.find(filter);
        
        const summary = {
            totalPayable: records.reduce((sum, record) => sum + record.netPayable, 0),
            totalPaid: records.reduce((sum, record) => sum + record.amountPaid, 0),
            totalRemaining: records.reduce((sum, record) => sum + record.remainingAmount, 0),
            totalRecords: records.length,
            paidCount: records.filter(record => record.paymentStatus === 'Paid').length,
            partialCount: records.filter(record => record.paymentStatus === 'Partial').length,
            unpaidCount: records.filter(record => record.paymentStatus === 'Unpaid').length,
            paymentPercentage: records.length > 0 ? 
                Math.round((records.reduce((sum, record) => sum + record.amountPaid, 0) / 
                           records.reduce((sum, record) => sum + record.netPayable, 0)) * 100) : 0
        };
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching salary summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch salary summary',
            error: error.message
        });
    }
};