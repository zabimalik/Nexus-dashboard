import mongoose from 'mongoose';

const certifiedStudentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        trim: true,
        unique: true
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
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    }
}, {
    timestamps: true
});

const CertifiedStudent = mongoose.model('CertifiedStudent', certifiedStudentSchema);

export default CertifiedStudent;