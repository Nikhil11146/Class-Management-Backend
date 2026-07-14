import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
    periodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Period",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

attendanceRecordSchema.index({
    periodId: 1,
    userId: 1
}, { unique: true });

const AttendanceRecordModel = mongoose.model('AttendanceRecord', attendanceRecordSchema);

export default AttendanceRecordModel;