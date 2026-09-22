import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { generateReferralCode } from '../utils/otp.js';

export const getUserById = async (userId) => {
    const [users] = await pool.query(
        `SELECT id, name, phone, email, role, profile_image, is_active, wallet_balance,
                rating_avg, rating_count, referral_code, city, created_at, updated_at
         FROM users WHERE id = ? LIMIT 1`,
        [userId]
    );
    if (users.length === 0) throw new ApiError(404, 'User not found');
    return users[0];
};

export const updateUserProfile = async (userId, patch) => {
    const allowed = ['name', 'email', 'phone', 'profile_image', 'city'];
    const fields = [];
    const params = [];
    for (const k of allowed) {
        if (k in patch && patch[k] !== undefined) {
            fields.push(`${k} = ?`);
            params.push(patch[k]);
        }
    }
    if (!fields.length) return getUserById(userId);
    params.push(userId);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    return getUserById(userId);
};

export const ensureReferralCode = async (userId) => {
    const [rows] = await pool.execute(`SELECT name, referral_code FROM users WHERE id = ?`, [userId]);
    if (!rows.length) throw new ApiError(404, 'User not found');
    if (rows[0].referral_code) return rows[0].referral_code;
    const code = generateReferralCode(rows[0].name);
    await pool.execute(`UPDATE users SET referral_code = ? WHERE id = ?`, [code, userId]);
    return code;
};

export const saveFcmToken = async (userId, token) => {
    await pool.execute(`UPDATE users SET fcm_token = ? WHERE id = ?`, [token, userId]);
};
