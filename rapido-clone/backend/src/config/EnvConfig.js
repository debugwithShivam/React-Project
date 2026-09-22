import dotenv from 'dotenv';

dotenv.config();

const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 4000),

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,

    DB_HOST: process.env.DB_HOST,
    DB_PORT: Number(process.env.DB_PORT || 3306),
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:19006,http://localhost:8081')
        .split(',')
        .map((s) => s.trim()),

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',

    DEFAULT_DRIVER_SEARCH_RADIUS_KM: Number(process.env.DEFAULT_DRIVER_SEARCH_RADIUS_KM || 5),
    DEFAULT_RIDE_REQUEST_TIMEOUT_SEC: Number(process.env.DEFAULT_RIDE_REQUEST_TIMEOUT_SEC || 30),
    DEFAULT_COMMISSION_PERCENT: Number(process.env.DEFAULT_COMMISSION_PERCENT || 15),
};

export default envConfig;
