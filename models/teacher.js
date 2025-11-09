import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    teacherId: {
        type: String,
        required: [true, 'Teacher ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Teacher ID cannot exceed 20 characters'],
        match: [/^[A-Z0-9-_]+$/, 'Teacher ID can only contain uppercase letters, numbers, hyphens, and underscores']
    },
    name: {
        type: String,
        required: [true, 'Teacher name is required'],
        trim: true,
        maxlength: [100, 'Teacher name cannot exceed 100 characters']
    },
    qualification: {
        type: String,
        required: [true, 'Qualification is required'],
        trim: true,
        maxlength: [200, 'Qualification cannot exceed 200 characters']
    },
    specialization: {
        type: String,
        required: [true, 'Specialization/Subject is required'],
        trim: true,
        maxlength: [100, 'Specialization cannot exceed 100 characters']
    },
    assignedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        default: Date.now
    }
}, {
    timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;