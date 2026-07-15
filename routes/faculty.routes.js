import { Router } from 'express';
import {
    createFacultyController,
    deleteFacultyController, getFacultiesController, getFacultyController,
    updateFacultyController
} from "../controllers/faculty.controller.js";

const facultyRouter = Router();

facultyRouter.get('/:facultyId', getFacultyController);
facultyRouter.get('/', getFacultiesController);
facultyRouter.post('/', createFacultyController);
facultyRouter.put('/:facultyId', updateFacultyController);
facultyRouter.delete('/:facultyId', deleteFacultyController);


export default facultyRouter;