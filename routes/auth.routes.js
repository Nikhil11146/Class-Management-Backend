import { Router } from 'express';
import { registerController, sendOtpController } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/send-otp', sendOtpController);

export default authRouter;