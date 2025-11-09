import CertifiedStudent from '../models/certifiedStudent.js';
import mongoose from 'mongoose';

// Create a new certified student
export const createCertifiedStudent = async (req, res) => {
    try {
        const { studentId, name, fatherName, course, startDate, endDate } = req.body;

        // Validate required fields
        if (!studentId || !name || !fatherName || !course || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: studentId, name, fatherName, course, startDate, and endDate are required'
            });
        }

        // Validate course ID
        if (!mongoose.Types.ObjectId.isValid(course)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format'
            });
        }

        // Check if student ID already exists
        const existingStudent = await CertifiedStudent.findOne({ studentId });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student ID already exists'
            });
        }

        const certifiedStudent = new CertifiedStudent({
            studentId,
            name,
            fatherName,
            course,
            startDate,
            endDate
        });

        await certifiedStudent.save();

        res.status(201).json({
            success: true,
            message: 'Certified student created successfully',
            data: certifiedStudent
        });

    } catch (error) {
        console.error('Error creating certified student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all certified students
export const getAllCertifiedStudents = async (req, res) => {
    try {
        const certifiedStudents = await CertifiedStudent.find()
            .populate('course', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: certifiedStudents.length,
            data: certifiedStudents
        });

    } catch (error) {
        console.error('Error fetching certified students:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single certified student by ID
export const getCertifiedStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid certified student ID format'
            });
        }
        
        const certifiedStudent = await CertifiedStudent.findById(id)
            .populate('course', 'name description');

        if (!certifiedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Certified student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: certifiedStudent
        });

    } catch (error) {
        console.error('Error fetching certified student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get certified student by student ID
export const getCertifiedStudentByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const certifiedStudent = await CertifiedStudent.findOne({ studentId })
            .populate('course', 'name description');

        if (!certifiedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Certified student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: certifiedStudent
        });

    } catch (error) {
        console.error('Error fetching certified student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update certified student
export const updateCertifiedStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, name, fatherName, course, startDate, endDate } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid certified student ID format'
            });
        }

        // Validate course ID if provided
        if (course && !mongoose.Types.ObjectId.isValid(course)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format'
            });
        }

        // Check if student ID already exists (if updating studentId)
        if (studentId) {
            const existingStudent = await CertifiedStudent.findOne({ 
                studentId, 
                _id: { $ne: id } 
            });
            
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID already exists'
                });
            }
        }

        const certifiedStudent = await CertifiedStudent.findByIdAndUpdate(
            id,
            { studentId, name, fatherName, course, startDate, endDate },
            { new: true, runValidators: true }
        ).populate('course', 'name description');

        if (!certifiedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Certified student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certified student updated successfully',
            data: certifiedStudent
        });

    } catch (error) {
        console.error('Error updating certified student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete certified student
export const deleteCertifiedStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid certified student ID format'
            });
        }
        
        const certifiedStudent = await CertifiedStudent.findByIdAndDelete(id);

        if (!certifiedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Certified student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Certified student deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting certified student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};