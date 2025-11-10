import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
    console.log(`\n📚 Found ${courses.length} courses in database:\n`);
    
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title || course.name} (ID: ${course._id})`);
      console.log(`   Fields: ${Object.keys(course).join(', ')}\n`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkCourses();
