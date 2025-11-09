import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/student.js';

dotenv.config();

const addStudentIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academy');
    console.log('Connected to MongoDB');

    // Find all students without studentId
    const studentsWithoutId = await Student.find({ studentId: { $exists: false } });
    console.log(`Found ${studentsWithoutId.length} students without studentId`);

    let counter = 1;
    for (const student of studentsWithoutId) {
      // Generate a unique student ID
      const studentId = `STU${String(counter).padStart(3, '0')}`;
      
      // Check if this ID already exists
      const existingStudent = await Student.findOne({ studentId });
      if (!existingStudent) {
        student.studentId = studentId;
        await student.save();
        console.log(`Updated student ${student.name} with ID: ${studentId}`);
        counter++;
      } else {
        // If ID exists, increment counter and try again
        counter++;
        const newStudentId = `STU${String(counter).padStart(3, '0')}`;
        student.studentId = newStudentId;
        await student.save();
        console.log(`Updated student ${student.name} with ID: ${newStudentId}`);
        counter++;
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addStudentIds();