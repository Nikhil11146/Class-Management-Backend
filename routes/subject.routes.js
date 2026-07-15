import { Router } from 'express';
import {
    createSubjectController, deleteSubjectController, getSubjectController, getSubjectsController,
    updateSubjectController
} from "../controllers/subject.controller.js";
import {modAuthMiddleware} from "../middlewares/modauth.middleware.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";

const subjectRouter = Router();

subjectRouter.get('/:subjectId', authMiddleware, getSubjectController);
subjectRouter.get('/', authMiddleware, getSubjectsController);
subjectRouter.post('/', authMiddleware, modAuthMiddleware, createSubjectController);
subjectRouter.put('/:subjectId', authMiddleware, modAuthMiddleware, updateSubjectController);
subjectRouter.delete('/:subjectId', authMiddleware, modAuthMiddleware, deleteSubjectController);


export default subjectRouter;