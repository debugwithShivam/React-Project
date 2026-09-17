import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import pool from './config/DBconfig/database.js';

// Routers
import authRouter from './routers/auth.routes.js';
import profileRouter from './routers/profile.routes.js';
import userRouter from './routers/user.routes.js';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get('/api/health',(req,res)=>{
    res.json({
        status:true,
        message:'Server is Running very Well',
    });
});

app.get('/api/db-test', async (req,res)=>{
    try{
        const [row] = await pool.query('SELECT 1 as result');
        res.json({
            success:true,
            database:row[0].result === 1
        })
    }catch(error){
        console.log(error);

        res.status(500).json({
            success:false,
            message:'Database Connection failed'
        })
    }
})

// All Router
app.use('/api/auth',authRouter)
app.use('/api',profileRouter)
app.use('/api/users',userRouter)

export default app;