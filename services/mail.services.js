import { Resend } from 'resend';
import { RESEND_API_KEY, EMAIL } from '../config/env.js';
import ApiError from "../classes/apiError.class.js";

const resend = new Resend(RESEND_API_KEY || 'placeholder_key');

export const sendOtpMail = async (email, otp) => {
    if (!RESEND_API_KEY) {
        throw new ApiError(500, "Email service configuration is missing (RESEND_API_KEY).");
    }

    try {
        // Resend's free tier requires using "onboarding@resend.dev" as the sender unless you verify a custom domain.
        const fromAddress = "onboarding@resend.dev";
        
        const { data, error } = await resend.emails.send({
            from: `ClassSync <${fromAddress}>`,
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
            throw new ApiError(500, error.message || "Failed to send email via Resend");
        }
    } catch (err) {
        throw err;
    }
}

