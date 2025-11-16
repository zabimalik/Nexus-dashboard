import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/student.js';
import Course from '../models/course.js';

dotenv.config();

const addPendingCertificates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Find or create a course
    let course = await Course.findOne();
    if (!course) {
      course = await Course.create({
        name: 'Web Development',
        description: 'Complete web development course',
        price: 50000,
        duration: '6 months',
        includes: ['HTML', 'CSS', 'JavaScript', 'React'],
        image: '',
        isActive: true
      });
      console.log('✅ Created sample course');
    }

    // Create sample students with pending certificates
    const sampleStudents = [
      {
        studentId: 'STU001',
        name: 'Ahmed Ali',
        fatherName: 'Muhammad Ali',
        course: course._id,
        joiningDate: new Date('2024-01-15'),
        courseStatus: 'completed',
        completionDate: new Date('2024-06-15'),
        certificateStatus: 'pending',
        certificateRequestDate: new Date('2024-06-20')
      },
      {
        studentId: 'STU002',
        name: 'Fatima Khan',
        fatherName: 'Imran Khan',
        course: course._id,
        joiningDate: new Date('2024-02-01'),
        courseStatus: 'completed',
        completionDate: new Date('2024-07-01'),
        certificateStatus: 'under_review',
        certificateRequestDate: new Date('2024-07-05'),
        certificateRemarks: 'Portfolio review pending'
      },
      {
        studentId: 'STU003',
        name: 'Hassan Ahmed',
        fatherName: 'Ahmed Hassan',
        course: course._id,
        joiningDate: new Date('2024-03-10'),
        courseStatus: 'completed',
        completionDate: new Date('2024-08-10'),
        certificateStatus: 'pending',
        certificateRequestDate: new Date('2024-08-15')
      }
    ];

    // Clear existing students and add new ones
    await Student.deleteMany({});
    const createdStudents = await Student.insertMany(sampleStudents);
    
    console.log(`✅ Created ${createdStudents.length} students with pending certificates`);
    
    createdStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.studentId}) - Status: ${student.certificateStatus}`);
    });

    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addPendingCertificates();