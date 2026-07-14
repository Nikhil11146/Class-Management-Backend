import nodemailer from 'nodemailer';
import { EMAIL, APP_PASSWORD } from '../config/env.js'
import ApiError from "../classes/apiError.class.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: APP_PASSWORD
    }
})

export const sendOtpMail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"ClassSync" <${EMAIL}>`,
            to: email,
            subject: "Email Verification",
            html: `
                <h2>Email Verification</h2>
                <p>Your One-Time Password (OTP) is:</p>
                
                <h1 style="letter-spacing:4px;">
                    ${otp}
                </h1>
                
                <p>This OTP is valid for 10 minutes.</p>
                
                <p>If you didn't request this, you can safely ignore this email.</p>
            `
        });
    } catch (err) {
        throw err;
    }
}

