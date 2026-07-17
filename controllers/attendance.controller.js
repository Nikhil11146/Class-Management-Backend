import AttendanceRecordModel from '../models/attendanceRecord.model.js';
import SubjectModel from '../models/subject.model.js';
import ApiError from '../classes/apiError.class.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/attendance
// Returns all attendance records for the logged-in user.
// Response shape matches the frontend's CourseAttendance[] interface.
// Includes ALL subjects in the group — even ones with zero attendance recorded.
// ─────────────────────────────────────────────────────────────────────────────
export const getMyAttendanceController = async (req, res, next) => {
    try {
        // 1. Fetch all subjects belonging to the user's group
        const subjects = await SubjectModel.find({ groupId: req.user.groupId }).lean();

        // 2. Fetch all attendance records for this user
        const records = await AttendanceRecordModel.find({ userId: req.user._id }).lean();

        // 3. Build attendance map keyed by subjectId
        const attendanceMap = {};
        for (const subject of subjects) {
            const subId = subject._id.toString();
            attendanceMap[subId] = {
                id: subId,
                name: subject.name,
                code: subject.code || '',
                weeklyDays: subject.weeklyDays || [],
                present: 0,
                absent: 0,
                extra: 0,
                history: {}
            };
        }

        // 4. Merge attendance records into the map
        for (const record of records) {
            const subId = record.subjectId.toString();
            if (!attendanceMap[subId]) continue;

            attendanceMap[subId].history[record.date] = record.statuses;

            for (const status of record.statuses) {
                if (status === 'present')      attendanceMap[subId].present++;
                else if (status === 'absent')  attendanceMap[subId].absent++;
                else if (status === 'extra')   attendanceMap[subId].extra++;
            }
        }

        res.status(200).send({
            success: true,
            message: 'Attendance retrieved successfully',
            data: {
                attendance: Object.values(attendanceMap)
            }
        });
    } catch (e) {
        next(e);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/attendance
// Body: { subjectId, date, statuses: ['present', 'absent', ...] }
// Creates or replaces the attendance record for a (user, subject, date).
// Passing all-'unmarked' or an empty statuses array clears the record.
// ─────────────────────────────────────────────────────────────────────────────
export const markAttendanceController = async (req, res, next) => {
    try {
        const { subjectId, date, statuses } = req.body;

        if (!subjectId || !date || !Array.isArray(statuses)) {
            throw new ApiError(400, 'Missing required fields: subjectId, date, statuses');
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
        }

        // Verify the subject belongs to the user's group
        const subject = await SubjectModel.findOne({ _id: subjectId, groupId: req.user.groupId });
        if (!subject) {
            throw new ApiError(404, 'Subject not found in your group');
        }

        // Filter to valid statuses only (drop 'unmarked')
        const validStatuses = statuses.filter(s => ['present', 'absent', 'extra'].includes(s));

        if (validStatuses.length === 0) {
            // No valid statuses — clear the record
            await AttendanceRecordModel.deleteOne({
                userId: req.user._id,
                subjectId,
                date
            });
            return res.status(200).send({
                success: true,
                message: 'Attendance cleared successfully',
                data: {}
            });
        }

        // Upsert the record
        const record = await AttendanceRecordModel.findOneAndUpdate(
            { userId: req.user._id, subjectId, date },
            { statuses: validStatuses },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).send({
            success: true,
            message: 'Attendance marked successfully',
            data: { record }
        });
    } catch (e) {
        next(e);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/attendance
// Body: { subjectId, date }
// Clears all attendance statuses for a (user, subject, date).
// ─────────────────────────────────────────────────────────────────────────────
export const clearAttendanceController = async (req, res, next) => {
    try {
        const { subjectId, date } = req.body;

        if (!subjectId || !date) {
            throw new ApiError(400, 'Missing required fields: subjectId, date');
        }

        await AttendanceRecordModel.deleteOne({
            userId: req.user._id,
            subjectId,
            date
        });

        res.status(200).send({
            success: true,
            message: 'Attendance cleared successfully',
            data: {}
        });
    } catch (e) {
        next(e);
    }
};
