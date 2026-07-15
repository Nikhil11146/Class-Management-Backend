import { Resend } from 'resend';
import { RESEND_API_KEY, FROM_EMAIL } from '../config/env.js';

export const resend = new Resend(RESEND_API_KEY);

export const sendOtpMail = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: `Class Management <${FROM_EMAIL}>`,
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
        
        if (error) {
            throw error;
        }
        
        return data;
    } catch (err) {
        throw err;
    }
}
