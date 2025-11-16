import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connect from './confiq/db.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import certifiedStudentRoutes from './routes/certifiedStudentRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config(); // ✅ safer than just "import 'dotenv/config'"

const app = express();

// ✅ Connect to database
connect();

// ✅ Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON format in request body. Please check your JSON syntax.' 
      });
      throw new Error('Invalid JSON');
    }
  }
})); // Parse JSON body with error handling
app.use(express.urlencoded({ extended: true })); // Parse form data if needed
app.use(express.text()); // Parse plain text (fallback)

// ✅ Custom middleware to handle JSON with wrong content-type
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('text/plain') && req.body) {
    try {
      // Try to parse the body as JSON
      if (typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
      }
    } catch (error) {
      console.log('Failed to parse request body as JSON:', error.message);
    }
  }
  next();
});

// ✅ Routes
console.log('Registering course routes...');
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/certified-students', certifiedStudentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
console.log('All routes registered');

// ✅ Root route (for quick testing)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
