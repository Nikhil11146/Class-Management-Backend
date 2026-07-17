import { Router } from 'express';
import { uploadProfilePhotoController, getProfileController, updateProfileController, changePasswordController, deleteUserController } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/me', authMiddleware, getProfileController);
userRouter.put('/me', authMiddleware, updateProfileController);
userRouter.delete('/me', authMiddleware, deleteUserController);
userRouter.put('/password', authMiddleware, changePasswordController);
userRouter.post('/profile-photo', authMiddleware, upload.single('photo'), uploadProfilePhotoController);

export default userRouter;