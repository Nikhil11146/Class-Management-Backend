import { Router } from 'express';
import { 
    uploadProfilePhotoController, 
    getProfileController, 
    updateProfileController, 
    changePasswordController, 
    deleteUserController,
    requestModeratorRoleController,
    getModeratorRequestsController,
    handleModeratorRequestController
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get('/me', authMiddleware, getProfileController);
userRouter.put('/me', authMiddleware, updateProfileController);
userRouter.delete('/me', authMiddleware, deleteUserController);
userRouter.put('/password', authMiddleware, changePasswordController);
userRouter.post('/profile-photo', authMiddleware, upload.single('photo'), uploadProfilePhotoController);

userRouter.post('/me/moderator-request', authMiddleware, requestModeratorRoleController);
userRouter.get('/moderator-requests', authMiddleware, getModeratorRequestsController);
userRouter.put('/:userId/moderator-request', authMiddleware, handleModeratorRequestController);

export default userRouter;