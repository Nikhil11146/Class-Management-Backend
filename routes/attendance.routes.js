import { Router } from 'express';
import {
    getMyAttendanceController,
    markAttendanceController,
    clearAttendanceController
} from '../controllers/attendance.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const attendanceRouter = Router();

// GET    /api/v1/attendance       — get all attendance for the logged-in user
// POST   /api/v1/attendance       — mark/update attendance for a (subject, date)
// DELETE /api/v1/attendance       — clear attendance for a (subject, date)

attendanceRouter.get('/', authMiddleware, getMyAttendanceController);
attendanceRouter.post('/', authMiddleware, markAttendanceController);
attendanceRouter.delete('/', authMiddleware, clearAttendanceController);

export default attendanceRouter;