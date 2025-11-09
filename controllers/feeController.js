import FeeRecord from '../models/feeRecord.js';
import Student from '../models/student.js';
import Course from '../models/course.js';
import mongoose from 'mongoose';

// Create a new fee record
export const createFeeRecord = async (req, res) => {
    try {
        const { 
            studentId, 
            courseId, 
            totalFee, 
            amountPaid = 0, 
            dueDate, 
            discount = 0,
            discountReason,
            remarks 
        } = req.body;

        // Validate required fields
        if (!studentId || !courseId || !totalFee || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: studentId, courseId, totalFee, and dueDate are required'
            });
        }

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format'
            });
        }

        // Find student by studentId (custom field)
        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if fee record already exists for this student and course
        const existingRecord = await FeeRecord.findOne({ 
            student: student._id, 
            course: courseId 
        });
        
        if (existingRecord) {
            return res.status(400).json({
                success: false,
                message: 'Fee record already exists for this student and course'
            });
        }

        // Validate amounts
        if (totalFee < 0 || amountPaid < 0 || discount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Amounts cannot be negative'
            });
        }

        if (amountPaid > (totalFee - discount)) {
            return res.status(400).json({
                success: false,
                message: 'Amount paid cannot exceed total fee minus discount'
            });
        }

        const feeRecord = new FeeRecord({
            studentId: student.studentId,
            studentName: student.name,
            student: student._id,
            course: courseId,
            courseName: course.name,
            totalFee,
            amountPaid,
            dueDate,
            discount,
            discountReason,
            remarks
        });

        await feeRecord.save();

        // Populate the response
        const populatedRecord = await FeeRecord.findById(feeRecord._id)
            .populate('student', 'studentId name fatherName')
            .populate('course', 'name description price');

        res.status(201).json({
            success: true,
            message: 'Fee record created successfully',
            data: populatedRecord
        });

    } catch (error) {
        console.error('Error creating fee record:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all fee records
export const getAllFeeRecords = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            status, 
            course, 
            studentId,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.paymentStatus = status;
        if (course) filter.course = course;
        if (studentId) filter.studentId = { $regex: studentId, $options: 'i' };

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const feeRecords = await FeeRecord.find(filter)
            .populate('student', 'studentId name fatherName phone')
            .populate('course', 'name description price')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalRecords = await FeeRecord.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / parseInt(limit));

        // Calculate summary statistics
        const summary = await FeeRecord.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalFee' },
                    totalCollected: { $sum: '$amountPaid' },
                    totalDiscount: { $sum: '$discount' },
                    totalPending: { 
                        $sum: { 
                            $subtract: [
                                { $subtract: ['$totalFee', '$discount'] },
                                '$amountPaid'
                            ]
                        }
                    },
                    paidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] }
                    },
                    partialCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Partial'] }, 1, 0] }
                    },
                    unpaidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: feeRecords,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            },
            summary: summary[0] || {
                totalRevenue: 0,
                totalCollected: 0,
                totalDiscount: 0,
                totalPending: 0,
                paidCount: 0,
                partialCount: 0,
                unpaidCount: 0
            }
        });

    } catch (error) {
        console.error('Error fetching fee records:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single fee record by ID
export const getFeeRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fee record ID format'
            });
        }

        const feeRecord = await FeeRecord.findById(id)
            .populate('student', 'studentId name fatherName phone')
            .populate('course', 'name description price');

        if (!feeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: feeRecord
        });

    } catch (error) {
        console.error('Error fetching fee record:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update fee record
export const updateFeeRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            totalFee, 
            amountPaid, 
            dueDate, 
            discount,
            discountReason,
            remarks 
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fee record ID format'
            });
        }

        const feeRecord = await FeeRecord.findById(id);
        if (!feeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        // Validate amounts if provided
        if (totalFee !== undefined && totalFee < 0) {
            return res.status(400).json({
                success: false,
                message: 'Total fee cannot be negative'
            });
        }

        if (amountPaid !== undefined && amountPaid < 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount paid cannot be negative'
            });
        }

        if (discount !== undefined && discount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount cannot be negative'
            });
        }

        // Update fields
        if (totalFee !== undefined) feeRecord.totalFee = totalFee;
        if (amountPaid !== undefined) feeRecord.amountPaid = amountPaid;
        if (dueDate !== undefined) feeRecord.dueDate = dueDate;
        if (discount !== undefined) feeRecord.discount = discount;
        if (discountReason !== undefined) feeRecord.discountReason = discountReason;
        if (remarks !== undefined) feeRecord.remarks = remarks;

        // Validate that amount paid doesn't exceed total minus discount
        const effectiveTotal = feeRecord.totalFee - feeRecord.discount;
        if (feeRecord.amountPaid > effectiveTotal) {
            return res.status(400).json({
                success: false,
                message: 'Amount paid cannot exceed total fee minus discount'
            });
        }

        await feeRecord.save();

        const updatedRecord = await FeeRecord.findById(id)
            .populate('student', 'studentId name fatherName phone')
            .populate('course', 'name description price');

        res.status(200).json({
            success: true,
            message: 'Fee record updated successfully',
            data: updatedRecord
        });

    } catch (error) {
        console.error('Error updating fee record:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add payment to fee record
export const addPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            amount, 
            paymentMethod = 'Cash', 
            transactionId, 
            remarks 
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fee record ID format'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount must be greater than zero'
            });
        }

        const feeRecord = await FeeRecord.findById(id);
        if (!feeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        const effectiveTotal = feeRecord.totalFee - feeRecord.discount;
        const remainingAmount = effectiveTotal - feeRecord.amountPaid;

        if (amount > remainingAmount) {
            return res.status(400).json({
                success: false,
                message: `Payment amount cannot exceed remaining balance of $${remainingAmount}`
            });
        }

        // Add installment
        feeRecord.installments.push({
            amount,
            paymentDate: new Date(),
            paymentMethod,
            transactionId,
            remarks
        });

        // Update total amount paid
        feeRecord.amountPaid += amount;

        await feeRecord.save();

        const updatedRecord = await FeeRecord.findById(id)
            .populate('student', 'studentId name fatherName phone')
            .populate('course', 'name description price');

        res.status(200).json({
            success: true,
            message: 'Payment added successfully',
            data: updatedRecord
        });

    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete fee record
export const deleteFeeRecord = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fee record ID format'
            });
        }

        const feeRecord = await FeeRecord.findByIdAndDelete(id);
        if (!feeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fee record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting fee record:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get fee records by student
export const getFeeRecordsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const feeRecords = await FeeRecord.find({ studentId })
            .populate('student', 'studentId name fatherName phone')
            .populate('course', 'name description price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feeRecords.length,
            data: feeRecords
        });

    } catch (error) {
        console.error('Error fetching student fee records:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Test endpoint
export const testFeeEndpoint = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Fee API is working!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Fee API test failed',
            error: error.message
        });
    }
};

// Get fee summary statistics
export const getFeeSummary = async (req, res) => {
    try {
        const summary = await FeeRecord.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalFee' },
                    totalCollected: { $sum: '$amountPaid' },
                    totalDiscount: { $sum: '$discount' },
                    totalPending: { 
                        $sum: { 
                            $subtract: [
                                { $subtract: ['$totalFee', '$discount'] },
                                '$amountPaid'
                            ]
                        }
                    },
                    totalRecords: { $sum: 1 },
                    paidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] }
                    },
                    partialCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Partial'] }, 1, 0] }
                    },
                    unpaidCount: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'Unpaid'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get monthly collection data for the last 12 months
        const monthlyData = await FeeRecord.aggregate([
            {
                $match: {
                    'installments.paymentDate': {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                    }
                }
            },
            { $unwind: '$installments' },
            {
                $group: {
                    _id: {
                        year: { $year: '$installments.paymentDate' },
                        month: { $month: '$installments.paymentDate' }
                    },
                    totalCollected: { $sum: '$installments.amount' },
                    paymentCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: summary[0] || {
                    totalRevenue: 0,
                    totalCollected: 0,
                    totalDiscount: 0,
                    totalPending: 0,
                    totalRecords: 0,
                    paidCount: 0,
                    partialCount: 0,
                    unpaidCount: 0
                },
                monthlyData
            }
        });

    } catch (error) {
        console.error('Error fetching fee summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};