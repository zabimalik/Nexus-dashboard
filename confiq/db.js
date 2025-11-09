import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const DB_NAME = process.env.DB_NAME;
const  MONGO_URL = process.env.MONGO_URL;

const connect = async () => {
    try {
        await mongoose.connect(MONGO_URL,{
            dbName: DB_NAME
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
export default connect;
