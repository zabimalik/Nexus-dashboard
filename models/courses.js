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
        maxlength: [1000, 'Course description cannot exceed 1000 characters']
    },
    include: [{
        type: String,
        trim: true
    }],
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'Course image is required'],
        trim: true
    }
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

export default Course;