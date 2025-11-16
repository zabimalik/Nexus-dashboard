import express from 'express';
import {
  getDashboardStats,
  getStatsSummary,
  getRecentEnrollments,
  getPopularCourses
} from '../controllers/dashboardController.js';

const router = express.Router();

// Get comprehensive dashboard data
router.get('/stats', getDashboardStats);

// Get summary statistics only
router.get('/stats/summary', getStatsSummary);

// Get recent enrollments
router.get('/recent-enrollments', getRecentEnrollments);

// Get popular courses
router.get('/popular-courses', getPopularCourses);

export default router;