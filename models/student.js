import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Student ID cannot exceed 20 characters'],
        validate: {
            validator: function(v) {
                return /^[A-Z0-9]+$/.test(v);
            },
            message: 'Student ID must contain only uppercase letters and numbers'
        }
    },
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true,
        maxlength: [100, 'Student name cannot exceed 100 characters']
    },
    fatherName: {
        type: String,
        required: [true, 'Father name is required'],
        trim: true,
        maxlength: [100, 'Father name cannot exceed 100 characters']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        default: Date.now
    },
    courseStatus: {
        type: String,
        required: [true, 'Course status is required'],
        enum: {
            values: ['active', 'completed', 'dropped'],
            message: 'Status must be either active, completed, or dropped'
        },
        default: 'active'
    },
    completionDate: {
        type: Date
    },
    certificateStatus: {
        type: String,
        enum: {
            values: ['not_requested', 'pending', 'under_review', 'certified', 'rejected'],
            message: 'Certificate status must be one of: not_requested, pending, under_review, certified, rejected'
        },
        default: 'not_requested'
    },
    certificateRequestDate: {
        type: Date
    },
    certificateRemarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Certificate remarks cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

export default Student;