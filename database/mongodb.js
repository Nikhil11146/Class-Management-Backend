import mongoose from 'mongoose';
import { DB_URI } from '../config/env.js';

if(!DB_URI) {
    throw new Error('MongoDB connection requires MongoDB connection');
}

export const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('MongoDB Connected Successfully.');
    } catch (e) {
        console.error(e);
    }
}
