import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        maxlength: [100, 'Course name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true,
        maxlength: [500, 'Course description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Course price cannot be negative']
    },
    duration: {
        type: String,
        required: [true, 'Course duration is required'],
        trim: true
    },
    includes: [{
        type: String,
        trim: true
    }],
    image: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for better query performance
courseSchema.index({ name: 1 });
courseSchema.index({ isActive: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;