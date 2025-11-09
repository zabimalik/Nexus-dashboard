import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/course.js';

dotenv.config();

const checkDatabase = async () => {
    try {
        console.log('🔍 Checking database...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academy');
        console.log('✅ Connected to MongoDB');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Available collections:');
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });
        
        // Check courses collection specifically
        const courseCount = await Course.countDocuments();
        console.log(`\n📚 Total courses in database: ${courseCount}`);
        
        if (courseCount > 0) {
            console.log('\n🎓 Existing courses:');
            const courses = await Course.find();
            courses.forEach((course, index) => {
                console.log(`   ${index + 1}. ${course.name} - $${course.price} (ID: ${course._id})`);
            });
        } else {
            console.log('\n⚠️  No courses found in database');
            console.log('💡 Try running: npm run seed:courses');
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Database check completed!');
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        console.log('\n💡 Make sure MongoDB is running and the connection string is correct');
    }
};

checkDatabase();