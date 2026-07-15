import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    DB_URI,
    CLIENT_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    RENDER_URL,
    RESEND_API_KEY,
    FROM_EMAIL
} = process.env;