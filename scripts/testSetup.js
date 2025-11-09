import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academy');
        console.log('✅ MongoDB connection successful!');
        
        // Test if we can list collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Available collections:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('✅ Test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        process.exit(1);
    }
};

testConnection();