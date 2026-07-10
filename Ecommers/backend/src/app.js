import express from 'express';
import morgan from 'morgan';
import authRouter from './router/auth.routes.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {db} from './db/dataBase.js';
import path from 'path'

let app = express();

app.use("/product",express.static('src/product'))
app.use(cors({
   origin: "http://localhost:5173",
   credentials: true
}));
app.use(cookieParser())
app.use(express.json())
app.use(morgan('dev'));
app.use('/auth',authRouter)

export default app;