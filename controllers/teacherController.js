import Teacher from '../models/teacher.js';
import mongoose from 'mongoose';

// Create a new teacher
export const createTeacher = async (req, res) => {
    try {
        const { teacherId, name, qualification, specialization, assignedCourses, joiningDate } = req.body;

        // Validate required fields
        if (!teacherId || !name || !qualification || !specialization) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: teacherId, name, qualification, and specialization are required'
            });
        }

        // Check if teacher ID already exists
        const existingTeacher = await Teacher.findOne({ teacherId: teacherId.toUpperCase() });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: `Teacher ID '${teacherId}' already exists. Please use a different ID.`
            });
        }

        // Validate assigned courses if provided
        if (assignedCourses && assignedCourses.length > 0) {
            for (const courseId of assignedCourses) {
                if (!mongoose.Types.ObjectId.isValid(courseId)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid course ID format: ${courseId}`
                    });
                }
            }
        }

        const teacher = new Teacher({
            teacherId: teacherId.toUpperCase(),
            name,
            qualification,
            specialization,
            assignedCourses: assignedCourses || [],
            joiningDate: joiningDate || Date.now()
        });

        await teacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: teacher
        });

    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('assignedCourses', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single teacher by ID
export const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid teacher ID format'
            });
        }
        
        const teacher = await Teacher.findById(id)
            .populate('assignedCourses', 'name description');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teacher
        });

    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update teacher
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherId, name, qualification, specialization, assignedCourses, joiningDate } = req.body;

        // If teacherId is being updated, check if it already exists
        if (teacherId) {
            const existingTeacher = await Teacher.findOne({ 
                teacherId: teacherId.toUpperCase(),
                _id: { $ne: id } // Exclude current teacher from check
            });
            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: `Teacher ID '${teacherId}' already exists. Please use a different ID.`
                });
            }
        }
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid teacher ID format'
            });
        }

        // Validate assigned courses if provided
        if (assignedCourses && assignedCourses.length > 0) {
            for (const courseId of assignedCourses) {
                if (!mongoose.Types.ObjectId.isValid(courseId)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid course ID format: ${courseId}`
                    });
                }
            }
        }

        const updateData = { name, qualification, specialization, assignedCourses, joiningDate };
        if (teacherId) {
            updateData.teacherId = teacherId.toUpperCase();
        }

        const teacher = await Teacher.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedCourses', 'name description');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher updated successfully',
            data: teacher
        });

    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid teacher ID format'
            });
        }
        
        const teacher = await Teacher.findByIdAndDelete(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};