import Student from '../models/student.js';
import CertifiedStudent from '../models/certifiedStudent.js';
import mongoose from 'mongoose';

// Create a new student
export const createStudent = async (req, res) => {
    try {
        const { studentId, name, fatherName, course, joiningDate, courseStatus } = req.body;

        // Validate required fields
        if (!studentId || !name || !fatherName || !course) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: studentId, name, fatherName, and course are required'
            });
        }
   // Validate course ID format
        if (!mongoose.Types.ObjectId.isValid(course)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format. Must be a valid MongoDB ObjectId'
            });
        }

        // Check if student ID already exists
        const existingStudentById = await Student.findOne({ studentId: studentId.toUpperCase() });
        if (existingStudentById) {
            return res.status(400).json({
                success: false,
                message: 'Student with this ID already exists'
            });
        }

        // Check if student already exists with same name and father name
        const existingStudent = await Student.findOne({ name, fatherName });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this name and father name already exists'
            });
        }

        const student = new Student({
            studentId: studentId.toUpperCase(),
            name,
            fatherName,
            course,
            joiningDate: joiningDate || Date.now(),
            courseStatus: courseStatus || 'active'
        });

        await student.save();

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: student
        });

    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('course', 'name description price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single student by ID
export const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).populate('course', 'name description price');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update student
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, name, fatherName, course, joiningDate, courseStatus } = req.body;

        // Validate course ID if provided
        if (course && !mongoose.Types.ObjectId.isValid(course)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format. Must be a valid MongoDB ObjectId'
            });
        }

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const previousStatus = (student.courseStatus || '').toLowerCase();

        // Check if studentId is being updated and if it already exists
        if (studentId !== undefined && studentId.toUpperCase() !== student.studentId) {
            const existingStudentById = await Student.findOne({ 
                studentId: studentId.toUpperCase(),
                _id: { $ne: id }
            });
            if (existingStudentById) {
                return res.status(400).json({
                    success: false,
                    message: 'Student with this ID already exists'
                });
            }
        }

        // Apply updates
        if (studentId !== undefined) student.studentId = studentId.toUpperCase();
        if (name !== undefined) student.name = name;
        if (fatherName !== undefined) student.fatherName = fatherName;
        if (course !== undefined) student.course = course;
        if (joiningDate !== undefined) student.joiningDate = joiningDate;
        if (courseStatus !== undefined) student.courseStatus = courseStatus;

        await student.save();

        // If status transitioned to completed, create certified student record
        const newStatus = (student.courseStatus || '').toLowerCase();
        if (newStatus === 'completed' && previousStatus !== 'completed') {
            try {
                const existingCertified = await CertifiedStudent.findOne({ studentId: student._id.toString() });
                if (!existingCertified) {
                    await CertifiedStudent.create({
                        studentId: student._id.toString(),
                        name: student.name,
                        fatherName: student.fatherName,
                        course: student.course,
                        startDate: student.joiningDate,
                        endDate: new Date()
                    });
                }
            } catch (certErr) {
                console.error('Error creating certified student record:', certErr);
                // We won't fail the entire update if certification creation fails
            }
        }

        const populated = await Student.findById(student._id).populate('course', 'name description price');

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: populated
        });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete student
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get students by course
export const getStudentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const students = await Student.find({ course: courseId })
            .populate('course', 'name description price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Error fetching students by course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};