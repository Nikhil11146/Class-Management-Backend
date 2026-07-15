import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    DB_URI,
    CLIENT_URL,
    EMAIL,
    APP_PASSWORD,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    RENDER_URL,
    RESEND_API_KEY
} = process.env;