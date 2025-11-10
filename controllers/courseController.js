import Course from '../models/course.js';
import { cloudinary } from '../confiq/cloudinary.js';
import { Readable } from 'stream';

// Get all active courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const { name, description, price, duration, includes } = req.body;
    
    // Handle includes - convert comma-separated string to array
    let includesArray = [];
    if (includes) {
      includesArray = typeof includes === 'string' 
        ? includes.split(',').map(item => item.trim()).filter(Boolean)
        : includes;
    }
    
    const courseData = {
      name,
      description,
      price: parseFloat(price),
      duration,
      includes: includesArray,
      image: '',
      isActive: true
    };
    
    // Handle image upload if file is provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'nexus/courses',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1600, height: 900, crop: 'fill', quality: 'auto' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        const readableStream = Readable.from(req.file.buffer);
        readableStream.pipe(uploadStream);
      });
      
      courseData.image = result.secure_url;
      courseData.imagePublicId = result.public_id;
    }
    
    const course = await Course.create(courseData);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, includes, isActive } = req.body;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Update fields
    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = parseFloat(price);
    if (duration !== undefined) course.duration = duration;
    if (isActive !== undefined) course.isActive = isActive === 'true' || isActive === true;
    
    // Handle includes
    if (includes !== undefined) {
      course.includes = typeof includes === 'string'
        ? includes.split(',').map(item => item.trim()).filter(Boolean)
        : includes;
    }
    
    // Handle image upload if new file is provided
    if (req.file) {
      // Delete old image if exists
      if (course.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(course.imagePublicId);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      
      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'nexus/courses',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1600, height: 900, crop: 'fill', quality: 'auto' }]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        const readableStream = Readable.from(req.file.buffer);
        readableStream.pipe(uploadStream);
      });
      
      course.image = result.secure_url;
      course.imagePublicId = result.public_id;
    }
    
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
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// Delete course (hard delete with image cleanup)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Delete image from Cloudinary if exists
    if (course.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(course.imagePublicId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    await Course.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// Upload course image
export const uploadCourseImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nexus/courses',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { width: 1600, height: 900, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const { Readable } = require('stream');
      const readableStream = Readable.from(req.file.buffer);
      readableStream.pipe(uploadStream);
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Delete course image from Cloudinary
export const deleteCourseImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};
