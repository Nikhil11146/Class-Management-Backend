import mongoose from 'mongoose';
import AttendanceRecordModel from './models/attendanceRecord.model.js';
import { connectDB } from './database/mongodb.js';

async function cleanup() {
    await connectDB();
    console.log("Connected to DB");
    
    const res = await AttendanceRecordModel.deleteMany({
        $or: [
            { subjectId: null },
            { date: null },
            { subjectId: { $exists: false } },
            { date: { $exists: false } }
        ]
    });
    console.log("Cleanup deleted count:", res.deletedCount);
    
    await mongoose.connection.close();
}
cleanup().catch(console.error);
