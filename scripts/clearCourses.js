import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Drop the entire courses collection
    await mongoose.connection.db.collection('courses').drop();
    console.log('🗑️  Dropped courses collection');

    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log('ℹ️  Courses collection does not exist');
      process.exit(0);
    }
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearCourses();
