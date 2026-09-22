import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import pool from './config/DBconfig/database.js';
import envConfig from './config/envConfig.js';

import authRouter from './routers/auth.routes.js';
import profileRouter from './routers/profile.routes.js';
import userRouter from './routers/user.routes.js';
import rideRouter from './routers/ride.routes.js';
import adminRouter from './routers/admin.routes.js';
import driverRouter from './routers/driver.routes.js';
import paymentRouter from './routers/payment.routes.js';
import vehicleRouter from './routers/vehicle.routes.js';
import miscRouter from './routers/misc.routes.js';
import { razorpayWebhookController } from './controllers/payment.controller.js';
import { notFoundHandler, globalErrorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || envConfig.CORS_ORIGINS.includes('*') || envConfig.CORS_ORIGINS.includes(origin))
                return callback(null, true);
            return callback(new Error('Origin not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), (req, res, next) => {
    try {
        req.body = JSON.parse(req.body.toString());
    } catch {}
    next();
}, razorpayWebhookController);

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
    res.json({ status: true, message: 'Server is running', time: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const [row] = await pool.query('SELECT 1 as result');
        res.json({ success: true, database: row[0].result === 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});

// Public
app.use('/api/pages', miscRouter);   // /api/pages, /api/pages/:slug are public inside misc router
app.use('/api', vehicleRouter);      // /api/vehicles, /api/cities
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);

// Authenticated
app.use('/api/users', userRouter);
app.use('/api', rideRouter);
app.use('/api/driver', driverRouter);
app.use('/api', paymentRouter);      // /api/order, /api/verify, /api/wallet, etc.
app.use('/api', miscRouter);

// Admin
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
