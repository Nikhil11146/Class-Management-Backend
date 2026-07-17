import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    date: {
        // YYYY-MM-DD — denormalized for efficient grouping
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    statuses: {
        type: [{
            type: String,
            enum: ['present', 'absent', 'extra']
        }],
        required: true,
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0,
            message: 'Statuses must be a non-empty array'
        }
    }
}, {
    timestamps: true
});

// One record per (user, subject, date)
attendanceRecordSchema.index({ userId: 1, subjectId: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ userId: 1, subjectId: 1 });

const AttendanceRecordModel = mongoose.model('AttendanceRecord', attendanceRecordSchema);

export default AttendanceRecordModel;