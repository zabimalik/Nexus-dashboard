import Course from '../models/course.js';
import mongoose from 'mongoose';

// Create a new course
export const createCourse = async (req, res) => {
    try {
        const { name, description, price, duration, includes, image } = req.body;

        // Validate required fields
        if (!name || !description || !price || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, description, price, and duration are required'
            });
        }

        // Check if course already exists
        const existingCourse = await Course.findOne({ name: name.trim() });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course with this name already exists'
            });
        }

        // Normalize includes: support comma-separated string or array
        let normalizedIncludes = [];
        if (Array.isArray(includes)) {
            normalizedIncludes = includes;
        } else if (typeof includes === 'string') {
            normalizedIncludes = includes
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
        }

        // If an image was uploaded via multer-cloudinary, use the resulting URL
        const imageUrl = req.file?.path || image || '';

        const course = new Course({
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            duration: duration.trim(),
            includes: normalizedIncludes,
            image: imageUrl
        });

        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });

    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Test endpoint
export const testCourseEndpoint = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Course API is working!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Course API test failed',
            error: error.message
        });
    }
};

// Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const { isActive, page = 1, limit = 50 } = req.query;
        
        const filter = {};
        // Only filter by isActive if explicitly provided
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        } else {
            // Default to showing active courses, but also include courses without isActive field
            filter.$or = [
                { isActive: true },
                { isActive: { $exists: false } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const courses = await Course.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalCourses = await Course.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: courses.length,
            total: totalCourses,
            data: courses
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format'
            });
        }

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });

    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update course
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, includes, image, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format'
            });
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if name is being updated and if it already exists
        if (name && name.trim() !== course.name) {
            const existingCourse = await Course.findOne({ 
                name: name.trim(),
                _id: { $ne: id }
            });
            if (existingCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Course with this name already exists'
                });
            }
        }

        // Update fields
        if (name !== undefined) course.name = name.trim();
        if (description !== undefined) course.description = description.trim();
        if (price !== undefined) course.price = parseFloat(price);
        if (duration !== undefined) course.duration = duration.trim();

        if (includes !== undefined) {
            if (Array.isArray(includes)) {
                course.includes = includes;
            } else if (typeof includes === 'string') {
                course.includes = includes
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean);
            }
        }

        // Prefer uploaded file URL if present
        const imageUrl = req.file?.path || image;
        if (imageUrl !== undefined) course.image = imageUrl;

        if (isActive !== undefined) course.isActive = isActive;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });

    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID format'
            });
        }

        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};