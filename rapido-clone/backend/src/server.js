import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import app from './app.js';
import pool from './config/DBconfig/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;



async function startServer() {
    await ensureAdmin();

    app.listen(PORT, () => {
        console.log(
            `Server running on Port ${PORT}`
        );
    });
}

startServer();