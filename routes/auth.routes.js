import { Router } from 'express';
import {
    forgotPasswordController,
    logInController,
    logoutAllController,
    registerController,
    sendOtpController, verifyOtpController,
    getCollegesController
} from "../controllers/auth.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js";
import {timeoutMiddleware} from "../middlewares/timeout.middleware.js";

const authRouter = Router();
// authRouter.use(timeoutMiddleware(15));

authRouter.post('/send-otp', sendOtpController);
authRouter.post('/register', registerController);
authRouter.post('/login', logInController);
authRouter.post('/logout-all', authMiddleware, logoutAllController);
authRouter.post('/forgot-password', forgotPasswordController);
authRouter.post('/verify-otp', verifyOtpController);
authRouter.get('/colleges', getCollegesController);

export default authRouter;