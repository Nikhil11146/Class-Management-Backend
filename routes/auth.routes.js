import { Router } from 'express';
import {
    forgotPasswordController,
    logInController,
    logoutAllController,
    registerController,
    sendOtpController
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/send-otp', sendOtpController);
authRouter.post('/register', registerController);
authRouter.post('/login', logInController);
authRouter.post('/logout-all', logoutAllController);
authRouter.post('/forgot-password', forgotPasswordController);

export default authRouter;