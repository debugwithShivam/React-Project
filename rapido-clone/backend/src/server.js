import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import app from './app.js';
import pool from './config/DBconfig/database.js';
import cors from 'cors'

dotenv.config();

const PORT = process.env.PORT || 5000;


async function ensureDatabaseSchema() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('USER', 'ADMIN', 'CAPTAIN') NOT NULL DEFAULT 'USER',
                profile_image VARCHAR(255) DEFAULT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_reset (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        const adminPassword = await bcrypt.hash('admin123', 12);
        await pool.query(`
            INSERT INTO users (name, phone, email, password_hash, role, is_active)
            VALUES ('Admin', '9999999999', 'admin@rapido.com', ?, 'ADMIN', 1)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                phone = VALUES(phone),
                password_hash = VALUES(password_hash),
                role = VALUES(role),
                is_active = VALUES(is_active)
        `, [adminPassword]);

        console.log('Database schema ready.');
    } catch (error) {
        console.error('Database setup failed:', error.message);
        process.exit(1);
    }
}

async function startServer() {
    await ensureDatabaseSchema();
    app.listen(PORT, () => {
        console.log(`Server running on Port ${PORT}`);
    });
}

startServer();