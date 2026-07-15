import { Router } from 'express';
import {
    deletePeriodController,
    getPeriodController,
    getPeriodsController,
    updatePeriodController
} from "../controllers/period.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {modAuthMiddleware} from "../middlewares/modauth.middleware.js";


const periodRouter = Router();

periodRouter.get('/:periodId', authMiddleware, getPeriodController);
periodRouter.get('/', authMiddleware, getPeriodsController);

periodRouter.put('/:periodId', authMiddleware, modAuthMiddleware, updatePeriodController);
periodRouter.delete('/:periodId', authMiddleware, modAuthMiddleware, deletePeriodController);

// GET 	    /api/periods/:periodId
// GET    	/api/periods
// GET    	/api/subjects/:subjectID/periods            X
// POST   	/api/subjects/:subjectID/periods            X
// PUT    	/api/periods/:periodID
// DELETE 	/api/periods/:periodID

export default periodRouter;