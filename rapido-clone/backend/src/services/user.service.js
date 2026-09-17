import pool from '../config/DBconfig/database.js';

export const getUserById = async (userId) => {
    const [users] = await pool.query(
        `SELECT
            id,
            name,
            phone,
            email,
            role,
            profile_image,
            is_active,
            created_at,
            updated_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [userId]
    );

    if (users.length === 0) {
        throw new Error('User not found');
    }

    return users[0];
};