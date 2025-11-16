import Student from '../models/student.js';
import Course from '../models/course.js';
import SalaryRecord from '../models/salaryRecord.js';
import BudgetRecord from '../models/budgetRecord.js';

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get current date for calculations
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Active students (current students with courseStatus 'active')
    const activeStudents = await Student.countDocuments({ courseStatus: 'active' });
    const lastMonthActiveStudents = await Student.countDocuments({
      courseStatus: 'active',
      createdAt: { $lt: currentMonth }
    });
    const studentsGrowth = lastMonthActiveStudents > 0 
      ? ((activeStudents - lastMonthActiveStudents) / lastMonthActiveStudents * 100).toFixed(1)
      : activeStudents > 0 ? 100 : 0;

    // Active courses (using isActive field from Course model)
    const activeCourses = await Course.countDocuments({ isActive: true });
    const lastMonthCourses = await Course.countDocuments({
      isActive: true,
      createdAt: { $lt: currentMonth }
    });
    const coursesGrowth = lastMonthCourses > 0
      ? ((activeCourses - lastMonthCourses) / lastMonthCourses * 100).toFixed(1)
      : activeCourses > 0 ? 100 : 0;

    // Revenue calculation from budget records (income category)
    const currentMonthRevenue = await BudgetRecord.aggregate([
      {
        $match: {
          category: 'income',
          date: { $gte: currentMonth, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const lastMonthRevenue = await BudgetRecord.aggregate([
      {
        $match: {
          category: 'income',
          date: { $gte: lastMonth, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = currentMonthRevenue[0]?.total || 0;
    const lastMonthRevenueAmount = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRevenueAmount > 0
      ? ((totalRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount * 100).toFixed(1)
      : totalRevenue > 0 ? 100 : 0;

    // Completion rate (certified students vs active students)
    const certifiedStudents = await Student.countDocuments({ certificateStatus: 'certified' });
    const totalStudentsForCompletion = await Student.countDocuments();
    const completionRate = totalStudentsForCompletion > 0 
      ? ((certifiedStudents / totalStudentsForCompletion) * 100).toFixed(1)
      : 0;

    // Last month completion rate for comparison
    const lastMonthCertified = await Student.countDocuments({
      certificateStatus: 'certified',
      updatedAt: { $lt: currentMonth }
    });
    const lastMonthTotalStudents = await Student.countDocuments({
      createdAt: { $lt: currentMonth }
    });
    const lastMonthCompletionRate = lastMonthTotalStudents > 0
      ? ((lastMonthCertified / lastMonthTotalStudents) * 100).toFixed(1)
      : 0;
    const completionGrowth = (completionRate - lastMonthCompletionRate).toFixed(1);

    // Recent enrollments (only active students)
    const recentEnrollments = await Student.find({ courseStatus: 'active' })
      .populate('course', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name course createdAt');

    // Popular courses (only count active students)
    const popularCourses = await Student.aggregate([
      {
        $match: { courseStatus: 'active' }
      },
      {
        $group: {
          _id: '$course',
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      {
        $unwind: '$courseInfo'
      },
      {
        $project: {
          _id: '$courseInfo._id',
          name: '$courseInfo.name',
          studentCount: 1,
          maxCapacity: '$courseInfo.maxStudents'
        }
      },
      {
        $sort: { studentCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const dashboardData = {
      stats: {
        totalStudents: activeStudents, // Changed to show active students
        activeCourses,
        totalRevenue,
        completionRate: parseFloat(completionRate),
        monthlyGrowth: {
          students: parseFloat(studentsGrowth),
          courses: parseFloat(coursesGrowth),
          revenue: parseFloat(revenueGrowth),
          completion: parseFloat(completionGrowth)
        }
      },
      recentEnrollments: recentEnrollments.map(enrollment => ({
        _id: enrollment._id,
        studentName: enrollment.name,
        courseName: enrollment.course?.name || 'Unknown Course',
        enrollmentDate: enrollment.createdAt
      })),
      popularCourses
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
};

// Get summary statistics only
const getStatsSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active students (current students)
    const activeStudents = await Student.countDocuments({ courseStatus: 'active' });
    const activeCourses = await Course.countDocuments({ isActive: true });
    
    // Revenue from budget records (income category)
    const revenueResult = await BudgetRecord.aggregate([
      {
        $match: {
          category: 'income',
          date: { $gte: currentMonth, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Completion rate based on certified students
    const certifiedStudents = await Student.countDocuments({ certificateStatus: 'certified' });
    const totalStudents = await Student.countDocuments();
    const completionRate = totalStudents > 0 ? ((certifiedStudents / totalStudents) * 100) : 0;

    res.json({
      totalStudents: activeStudents, // Show active students
      activeCourses,
      totalRevenue: revenueResult[0]?.total || 0,
      completionRate: parseFloat(completionRate.toFixed(1))
    });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    res.status(500).json({ message: 'Error fetching statistics summary', error: error.message });
  }
};

// Get recent enrollments
const getRecentEnrollments = async (req, res) => {
  try {
    const recentEnrollments = await Student.find({ courseStatus: 'active' })
      .populate('course', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name course createdAt courseStatus');

    const formattedEnrollments = recentEnrollments.map(enrollment => ({
      _id: enrollment._id,
      studentName: enrollment.name,
      courseName: enrollment.course?.name || 'Unknown Course',
      enrollmentDate: enrollment.createdAt,
      status: enrollment.courseStatus
    }));

    res.json(formattedEnrollments);
  } catch (error) {
    console.error('Error fetching recent enrollments:', error);
    res.status(500).json({ message: 'Error fetching recent enrollments', error: error.message });
  }
};

// Get popular courses
const getPopularCourses = async (req, res) => {
  try {
    const popularCourses = await Student.aggregate([
      {
        $match: { courseStatus: 'active' }
      },
      {
        $group: {
          _id: '$course',
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      {
        $unwind: '$courseInfo'
      },
      {
        $project: {
          _id: '$courseInfo._id',
          name: '$courseInfo.name',
          studentCount: 1,
          maxCapacity: '$courseInfo.maxStudents'
        }
      },
      {
        $sort: { studentCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(popularCourses);
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    res.status(500).json({ message: 'Error fetching popular courses', error: error.message });
  }
};

export {
  getDashboardStats,
  getStatsSummary,
  getRecentEnrollments,
  getPopularCourses
};