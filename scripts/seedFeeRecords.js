import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FeeRecord from '../models/feeRecord.js';
import Student from '../models/student.js';
import Course from '../models/course.js';

dotenv.config();

const seedFeeRecords = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academy');
        console.log('Connected to MongoDB');

        // Clear existing fee records
        await FeeRecord.deleteMany({});
        console.log('Cleared existing fee records');

        // Get some students and courses
        const students = await Student.find().limit(5);
        const courses = await Course.find().limit(3);

        if (students.length === 0) {
            console.log('No students found. Please add some students first.');
            process.exit(1);
        }

        if (courses.length === 0) {
            console.log('No courses found. Please run seed:courses first.');
            process.exit(1);
        }

        const sampleFeeRecords = [];

        // Create fee records for each student-course combination
        for (let i = 0; i < Math.min(students.length, 5); i++) {
            const student = students[i];
            const course = courses[i % courses.length];
            
            const amountPaid = Math.floor(Math.random() * course.price);
            const discount = Math.floor(Math.random() * 2000);
            
            sampleFeeRecords.push({
                studentId: student.studentId,
                studentName: student.name,
                student: student._id,
                course: course._id,
                courseName: course.name,
                totalFee: course.price,
                amountPaid: amountPaid,
                discount: discount,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                remarks: `Fee record for ${student.name} - ${course.name}`
            });
        }

        // Insert sample fee records
        const feeRecords = await FeeRecord.insertMany(sampleFeeRecords);
        console.log(`Inserted ${feeRecords.length} fee records successfully!`);

        // Display created fee records
        feeRecords.forEach(record => {
            console.log(`- ${record.studentName} (${record.studentId}) - ${record.courseName}: $${record.totalFee}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding fee records:', error);
        process.exit(1);
    }
};

seedFeeRecords();