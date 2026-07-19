import AttendanceRecordModel from '../models/attendanceRecord.model.js';
import DayNoteModel from '../models/dayNote.model.js';
import SubjectModel from '../models/subject.model.js';
import GroupModel from '../models/group.model.js';
import ApiError from '../classes/apiError.class.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/attendance
// Returns all subjects for the group with merged attendance history, personal
// notes, and mod/admin broadcast notes.
// ─────────────────────────────────────────────────────────────────────────────
export const getMyAttendanceController = async (req, res, next) => {
    try {
        const [subjects, records, dayNotes] = await Promise.all([
            SubjectModel.find({ groupId: req.user.groupId }).lean(),
            AttendanceRecordModel.find({ userId: req.user._id }).lean(),
            DayNoteModel.find({ groupId: req.user.groupId }).lean()
        ]);

        // Build attendance map keyed by subjectId (all subjects shown even with zero records)
        const attendanceMap = {};
        for (const subject of subjects) {
            const subId = subject._id.toString();
            attendanceMap[subId] = {
                id: subId,
                name: subject.name,
                code: subject.code || '',
                weeklyDays: subject.weeklyDays || [],
                createdAt: subject.createdAt,
                present: 0,
                absent: 0,
                extra: 0,
                history: {},
                personalNotes: {},   // { "YYYY-MM-DD": "personal note text" }
                modNotes: {}         // { "YYYY-MM-DD": "broadcast note text" }
            };
        }

        // Merge attendance records → history + personalNotes
        for (const record of records) {
            const subId = record.subjectId.toString();
            if (!attendanceMap[subId]) continue;

            attendanceMap[subId].history[record.date] = record.statuses;

            if (record.note && record.note.trim()) {
                attendanceMap[subId].personalNotes[record.date] = record.note.trim();
            }

            for (const status of record.statuses) {
                if (status === 'present')      attendanceMap[subId].present++;
                else if (status === 'absent')  attendanceMap[subId].absent++;
                else if (status === 'extra')   attendanceMap[subId].extra++;
            }
        }

        // Merge mod/admin day notes → modNotes
        for (const dayNote of dayNotes) {
            const subId = dayNote.subjectId.toString();
            if (!attendanceMap[subId]) continue;
            attendanceMap[subId].modNotes[dayNote.date] = dayNote.note;
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
// Body: { subjectId, date, statuses: [...], note?: string }
// Creates or replaces the attendance record (and personal note) for a day.
// ─────────────────────────────────────────────────────────────────────────────
export const markAttendanceController = async (req, res, next) => {
    try {
        const { subjectId, date, statuses, note } = req.body;

        if (!subjectId || !date || !Array.isArray(statuses)) {
            throw new ApiError(400, 'Missing required fields: subjectId, date, statuses');
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
        }

        const subject = await SubjectModel.findOne({ _id: subjectId, groupId: req.user.groupId });
        if (!subject) {
            throw new ApiError(404, 'Subject not found in your group');
        }

        const validStatuses = statuses.filter(s => ['present', 'absent', 'extra'].includes(s));

        if (validStatuses.length === 0) {
            // Clear the record entirely
            await AttendanceRecordModel.deleteOne({ userId: req.user._id, subjectId, date });
            return res.status(200).send({
                success: true,
                message: 'Attendance cleared',
                data: {}
            });
        }

        const updatePayload = {
            statuses: validStatuses,
            ...(note !== undefined && { note: note.trim() })
        };

        const record = await AttendanceRecordModel.findOneAndUpdate(
            { userId: req.user._id, subjectId, date },
            updatePayload,
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
// Clears attendance for a (user, subject, date).
// ─────────────────────────────────────────────────────────────────────────────
export const clearAttendanceController = async (req, res, next) => {
    try {
        const { subjectId, date } = req.body;

        if (!subjectId || !date) {
            throw new ApiError(400, 'Missing required fields: subjectId, date');
        }

        await AttendanceRecordModel.deleteOne({ userId: req.user._id, subjectId, date });

        res.status(200).send({
            success: true,
            message: 'Attendance cleared successfully',
            data: {}
        });
    } catch (e) {
        next(e);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/attendance/mod-notes         (mod/admin only)
// Body: { subjectId, date, note }
// Creates or updates a broadcast day note visible to all students.
// Passing an empty/blank note string deletes the note.
// ─────────────────────────────────────────────────────────────────────────────
export const upsertModNoteController = async (req, res, next) => {
    try {
        const { subjectId, date, note } = req.body;

        if (!subjectId || !date || note === undefined) {
            throw new ApiError(400, 'Missing required fields: subjectId, date, note');
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
        }

        // Resolve the moderator's group
        const group = await GroupModel.findOne({ moderatorId: req.user._id });
        if (!group) {
            throw new ApiError(403, 'You are not a moderator of any group');
        }

        const subject = await SubjectModel.findOne({ _id: subjectId, groupId: group._id });
        if (!subject) {
            throw new ApiError(404, 'Subject not found in your group');
        }

        const trimmedNote = typeof note === 'string' ? note.trim() : '';

        if (!trimmedNote) {
            // Empty note → delete it
            await DayNoteModel.deleteOne({ subjectId, groupId: group._id, date });
            return res.status(200).send({
                success: true,
                message: 'Note deleted successfully',
                data: {}
            });
        }

        const dayNote = await DayNoteModel.findOneAndUpdate(
            { subjectId, groupId: group._id, date },
            { note: trimmedNote, createdBy: req.user._id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).send({
            success: true,
            message: 'Note saved successfully',
            data: { dayNote }
        });
    } catch (e) {
        next(e);
    }
};
