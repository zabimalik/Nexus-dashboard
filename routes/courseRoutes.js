import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseImage,
  deleteCourseImage
} from '../controllers/courseController.js';
import { upload } from '../confiq/cloudinary.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Course Routes] ${req.method} ${req.path}`);
  next();
});

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin routes (add authentication middleware if needed)
router.post('/', upload.single('image'), createCourse);
router.put('/:id', upload.single('image'), updateCourse);
router.delete('/:id', deleteCourse);

// Image upload routes
router.post('/upload-image', upload.single('image'), uploadCourseImage);
router.delete('/delete-image', deleteCourseImage);

export default router;
