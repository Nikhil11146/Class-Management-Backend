import { Router } from 'express';
import subjectRouter from "./subject.routes.js";
import authRouter from "./auth.routes.js";
import attendanceRouter from "./attendance.routes.js";
import userRouter from "./user.routes.js";
import announcementRouter from "./announcement.routes.js";
import periodRouter from "./period.routes.js";
import facultyRouter from "./faculty.routes.js";

const routesRouter = Router();

routesRouter.use('/subjects', subjectRouter);
routesRouter.use('/periods', periodRouter);
routesRouter.use('/announcements', announcementRouter);
routesRouter.use('/users', userRouter);
routesRouter.use('/attendance', attendanceRouter);
routesRouter.use('/auth', authRouter);
routesRouter.use('/faculty', facultyRouter);

export default routesRouter;