import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    DB_URI,
    CLIENT_URL,
    EMAIL,
    APP_PASSWORD
} = process.env;