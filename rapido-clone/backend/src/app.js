import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import pool from './config/DBconfig/database.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get('/api/health',(req,res)=>{
    res.json({
        Status:true,
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

export default app;