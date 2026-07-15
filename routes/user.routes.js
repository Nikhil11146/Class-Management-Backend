import { Router } from 'express';
import { uploadProfilePhotoController } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.post('/profile-photo', authMiddleware, upload.single('photo'), uploadProfilePhotoController);

export default userRouter;