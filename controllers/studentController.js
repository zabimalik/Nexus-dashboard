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
        
        // Handle certificate-related fields
        if (req.body.certificateStatus !== undefined) student.certificateStatus = req.body.certificateStatus;
        if (req.body.certificateRequestDate !== undefined) student.certificateRequestDate = req.body.certificateRequestDate;
        if (req.body.certificateRemarks !== undefined) student.certificateRemarks = req.body.certificateRemarks;
        if (req.body.completionDate !== undefined) student.completionDate = req.body.completionDate;

        await student.save();

        // If status transitioned to completed, create certified student record
        const newStatus = (student.courseStatus || '').toLowerCase();
        if (newStatus === 'completed' && previousStatus !== 'completed') {
            try {
                const existingCertified = await CertifiedStudent.findOne({ studentId: student.studentId });
                if (!existingCertified) {
                    await CertifiedStudent.create({
                        studentId: student.studentId, // Use admin-defined student ID, not MongoDB ObjectId
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
// Get students with pending certificates
export const getPendingCertificates = async (req, res) => {
    try {
        // Only get completed students with pending certificate requests
        const pendingStudents = await Student.find({
            courseStatus: 'completed',
            certificateStatus: { $in: ['pending', 'under_review'] }
        })
        .populate('course', 'name')
        .sort({ certificateRequestDate: 1 }); // Oldest requests first

        // Transform data and calculate days pending
        const transformedStudents = pendingStudents.map(student => {
            const daysPending = student.certificateRequestDate 
                ? Math.floor((new Date() - new Date(student.certificateRequestDate)) / (1000 * 60 * 60 * 24))
                : 0;

            return {
                id: student.studentId,
                name: student.name,
                fatherName: student.fatherName,
                courseName: student.course?.name || 'Unknown Course',
                courseId: student.course?._id || '',
                enrollmentDate: student.joiningDate,
                completionDate: student.completionDate || student.updatedAt,
                certificateStatus: student.certificateStatus,
                certificateRequestDate: student.certificateRequestDate,
                daysPending,
                remarks: student.certificateRemarks
            };
        });

        res.status(200).json({
            success: true,
            count: transformedStudents.length,
            data: transformedStudents
        });
    } catch (error) {
        console.error('Error fetching pending certificates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending certificates',
            error: error.message
        });
    }
};

// Get certificate summary statistics
export const getCertificateSummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get total pending certificates (only from completed students)
        const totalPending = await Student.countDocuments({
            courseStatus: 'completed',
            certificateStatus: { $in: ['pending', 'under_review'] }
        });

        // Get this month's requests (only from completed students)
        const thisMonth = await Student.countDocuments({
            courseStatus: 'completed',
            certificateStatus: { $in: ['pending', 'under_review'] },
            certificateRequestDate: { $gte: startOfMonth }
        });

        // Calculate average processing days (only from completed students)
        const pendingStudents = await Student.find({
            courseStatus: 'completed',
            certificateStatus: { $in: ['pending', 'under_review'] },
            certificateRequestDate: { $exists: true }
        });

        let totalDays = 0;
        pendingStudents.forEach(student => {
            if (student.certificateRequestDate) {
                const days = Math.floor((now - new Date(student.certificateRequestDate)) / (1000 * 60 * 60 * 24));
                totalDays += days;
            }
        });

        const avgProcessingDays = pendingStudents.length > 0 ? Math.round(totalDays / pendingStudents.length) : 0;

        // Get course breakdown (only from completed students)
        const courseBreakdown = await Student.aggregate([
            {
                $match: {
                    courseStatus: 'completed',
                    certificateStatus: { $in: ['pending', 'under_review'] }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            {
                $unwind: '$courseInfo'
            },
            {
                $group: {
                    _id: '$courseInfo.name',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    courseName: '$_id',
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const summary = {
            totalPending,
            thisMonth,
            avgProcessingDays,
            courseBreakdown
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching certificate summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificate summary',
            error: error.message
        });
    }
};

// Update certificate status
export const updateCertificateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { certificateStatus, remarks } = req.body;

        // Validate certificate status
        const validStatuses = ['not_requested', 'pending', 'under_review', 'certified', 'rejected'];
        if (!validStatuses.includes(certificateStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid certificate status'
            });
        }

        const student = await Student.findOne({ studentId: id });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update certificate status and remarks
        student.certificateStatus = certificateStatus;
        student.certificateRemarks = remarks || '';

        // If approving certificate, move to certified students collection
        if (certificateStatus === 'certified') {
            try {
                // Check if certified student record already exists
                const existingCertified = await CertifiedStudent.findOne({ studentId: student.studentId });
                if (!existingCertified) {
                    // Create certified student record using admin-defined student ID
                    const certifiedStudent = new CertifiedStudent({
                        studentId: student.studentId, // Use admin-defined student ID (e.g., "STU001")
                        name: student.name,
                        fatherName: student.fatherName,
                        course: student.course,
                        startDate: student.joiningDate,
                        endDate: student.completionDate || new Date()
                    });

                    await certifiedStudent.save();
                    console.log(`Created certified student record for ${student.studentId}`);
                }
            } catch (certErr) {
                console.error('Error creating certified student record:', certErr);
                // Don't fail the certificate approval if certified student creation fails
            }
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: `Certificate ${certificateStatus} successfully`,
            data: {
                studentId: student.studentId,
                certificateStatus: student.certificateStatus,
                remarks: student.certificateRemarks
            }
        });
    } catch (error) {
        console.error('Error updating certificate status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update certificate status',
            error: error.message
        });
    }
};