import { Router } from 'express';
import { uploadProfilePhotoController, getProfileController, updateProfileController } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/me', authMiddleware, getProfileController);
userRouter.put('/me', authMiddleware, updateProfileController);
userRouter.post('/profile-photo', authMiddleware, upload.single('photo'), uploadProfilePhotoController);

export default userRouter;