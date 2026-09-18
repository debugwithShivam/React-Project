import bcrypt from 'bcrypt';
import pool from './DBconfig/database.js';

const createAdmin = async () => {
    try {
        const password = 'Sawaari@123';

        const passwordHash = await bcrypt.hash(password, 12);

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
            [
                'Sawaari Admin',
                '8888888888',
                'admin@sawaari.com',
                passwordHash
            ]
        );

        console.log('ADMIN ACCOUNT CREATED');
        console.log('Email:', 'admin@sawaari.com');
        console.log('Password:', password);

        process.exit(0);

    } catch (error) {
        console.error('ADMIN CREATION ERROR:', error);
        process.exit(1);
    }
};

createAdmin();