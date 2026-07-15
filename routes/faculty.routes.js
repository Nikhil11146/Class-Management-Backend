import { Router } from 'express';
import {
    createFacultyController,
    deleteFacultyController, getFacultiesController, getFacultyController,
    updateFacultyController, uploadFacultyPhotoController
} from "../controllers/faculty.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { modAuthMiddleware } from "../middlewares/modauth.middleware.js";

const facultyRouter = Router();

facultyRouter.get('/:facultyId', getFacultyController);
facultyRouter.get('/', getFacultiesController);
facultyRouter.post('/', createFacultyController);
facultyRouter.put('/:facultyId', updateFacultyController);
facultyRouter.delete('/:facultyId', deleteFacultyController);
facultyRouter.post('/:facultyId/profile-photo', authMiddleware, modAuthMiddleware, upload.single('photo'), uploadFacultyPhotoController);


export default facultyRouter;