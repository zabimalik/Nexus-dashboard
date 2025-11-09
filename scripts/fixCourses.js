import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/course.js';

dotenv.config();

const fixCourses = async () => {
    try {
        console.log('🔧 Fixing courses...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academy');
        console.log('✅ Connected to MongoDB');
        
        // Find all courses
        const courses = await Course.find();
        console.log(`📚 Found ${courses.length} courses`);
        
        // Update courses that don't have isActive field or have it set to false
        const updateResult = await Course.updateMany(
            { $or: [{ isActive: { $exists: false } }, { isActive: false }] },
            { $set: { isActive: true } }
        );
        
        console.log(`✅ Updated ${updateResult.modifiedCount} courses to be active`);
        
        // Show all courses after update
        const updatedCourses = await Course.find();
        console.log('\n🎓 All courses after update:');
        updatedCourses.forEach((course, index) => {
            console.log(`   ${index + 1}. ${course.name} - $${course.price} (Active: ${course.isActive})`);
        });
        
        await mongoose.disconnect();
        console.log('\n✅ Course fix completed!');
        
    } catch (error) {
        console.error('❌ Course fix failed:', error.message);
    }
};

fixCourses();