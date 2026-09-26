import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from './DBconfig/database.js';

dotenv.config();

const createAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL || 'admin@sawaari.com';
        const phone = process.env.ADMIN_PHONE || '8888888888';
        const name = process.env.ADMIN_NAME || 'Sawaari Admin';
        const password = process.env.ADMIN_PASSWORD;

        if (!password) {
            console.error('ADMIN_PASSWORD must be configured in environment variables');
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
            [email, phone]
        );

        if (existing.length > 0) {
            await pool.query(
                `UPDATE users SET name = ?, phone = ?, email = ?, password_hash = ?, role = 'ADMIN', is_active = 1 WHERE id = ?`,
                [name, phone, email, passwordHash, existing[0].id]
            );
            console.log('Admin account updated successfully.');
            console.log('Email:', email);
            process.exit(0);
        }

        await pool.query(
            `
            INSERT INTO users
            (
                name,
                phone,
                email,
                password_hash,
                role,
                is_active
            )
            VALUES (?, ?, ?, ?, 'ADMIN', 1)
            `,
            [name, phone, email, passwordHash]
        );

        console.log('ADMIN ACCOUNT CREATED');
        console.log('Email:', email);

        process.exit(0);
    } catch (error) {
        console.error('ADMIN CREATION ERROR:', error.message || error);
        process.exit(1);
    }
};

createAdmin();