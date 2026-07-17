import { Router } from 'express';
import {
    getMyAttendanceController,
    markAttendanceController,
    clearAttendanceController,
    upsertModNoteController
} from '../controllers/attendance.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { modAuthMiddleware } from '../middlewares/modauth.middleware.js';

const attendanceRouter = Router();

// ── Student / all-user routes ─────────────────────────────────────────────────
// GET    /api/v1/attendance       — all attendance + notes for the logged-in user
// POST   /api/v1/attendance       — mark/update attendance (+ personal note)
// DELETE /api/v1/attendance       — clear attendance for a (subject, date)

attendanceRouter.get('/', authMiddleware, getMyAttendanceController);
attendanceRouter.post('/', authMiddleware, markAttendanceController);
attendanceRouter.delete('/', authMiddleware, clearAttendanceController);

// ── Moderator / Admin routes ──────────────────────────────────────────────────
// POST   /api/v1/attendance/mod-notes   — upsert a broadcast day note (empty note = delete)

attendanceRouter.post('/mod-notes', authMiddleware, modAuthMiddleware, upsertModNoteController);

export default attendanceRouter;