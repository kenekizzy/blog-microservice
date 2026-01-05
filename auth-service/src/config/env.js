import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const {
    PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRE,
    NODEMAILER_PASSWORD,
    FRONTEND_URL,
    REDIS_URL
} = process.env;

export { NODE_ENV, DB_URI, JWT_SECRET, JWT_EXPIRE, NODEMAILER_PASSWORD, FRONTEND_URL, PORT, REDIS_URL };
