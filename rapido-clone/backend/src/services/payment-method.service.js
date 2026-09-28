import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';

let tableReady;
const ensureTable = () => {
    if (!tableReady) {
        tableReady = pool.execute(`CREATE TABLE IF NOT EXISTS saved_payment_methods (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            method_type ENUM('UPI') NOT NULL DEFAULT 'UPI',
            label VARCHAR(40) NOT NULL DEFAULT 'UPI',
            upi_id VARCHAR(100) NOT NULL,
            is_default BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_user_upi (user_id, upi_id),
            INDEX idx_payment_methods_user (user_id)
        )`).catch((error) => { tableReady = null; throw error; });
    }
    return tableReady;
};

const cleanUpi = (value) => {
    const upi = String(value || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{1,}@[a-z][a-z0-9.-]{1,}$/i.test(upi)) {
        throw new ApiError(400, 'Enter a valid UPI ID, for example name@bank');
    }
    return upi;
};

export const listMethods = async (userId) => {
    await ensureTable();
    const [rows] = await pool.execute(
        'SELECT id, method_type, label, upi_id, is_default, created_at FROM saved_payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
        [userId]
    );
    return rows;
};

export const addMethod = async ({ userId, upiId, label }) => {
    await ensureTable();
    const upi = cleanUpi(upiId);
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId]);
        const [existing] = await conn.execute('SELECT id FROM saved_payment_methods WHERE user_id = ? LIMIT 1 FOR UPDATE', [userId]);
        const isDefault = existing.length === 0;
        const [result] = await conn.execute(
            'INSERT INTO saved_payment_methods (user_id, label, upi_id, is_default) VALUES (?, ?, ?, ?)',
            [userId, String(label || 'UPI').trim().slice(0, 40) || 'UPI', upi, isDefault]
        );
        await conn.commit();
        const [rows] = await pool.execute('SELECT id, method_type, label, upi_id, is_default, created_at FROM saved_payment_methods WHERE id = ?', [result.insertId]);
        return rows[0];
    } catch (error) {
        await conn.rollback();
        if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'This UPI ID is already saved');
        throw error;
    } finally { conn.release(); }
};

export const setDefaultMethod = async (id, userId) => {
    await ensureTable();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.execute('SELECT id FROM saved_payment_methods WHERE id = ? AND user_id = ? FOR UPDATE', [id, userId]);
        if (!rows.length) throw new ApiError(404, 'Payment method not found');
        await conn.execute('UPDATE saved_payment_methods SET is_default = FALSE WHERE user_id = ?', [userId]);
        await conn.execute('UPDATE saved_payment_methods SET is_default = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
        await conn.commit();
        return (await listMethods(userId));
    } catch (error) { await conn.rollback(); throw error; }
    finally { conn.release(); }
};

export const deleteMethod = async (id, userId) => {
    await ensureTable();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.execute('SELECT is_default FROM saved_payment_methods WHERE id = ? AND user_id = ? FOR UPDATE', [id, userId]);
        if (!rows.length) throw new ApiError(404, 'Payment method not found');
        await conn.execute('DELETE FROM saved_payment_methods WHERE id = ? AND user_id = ?', [id, userId]);
        if (rows[0].is_default) {
            await conn.execute('UPDATE saved_payment_methods SET is_default = TRUE WHERE user_id = ? ORDER BY created_at ASC LIMIT 1', [userId]);
        }
        await conn.commit();
        return { success: true };
    } catch (error) { await conn.rollback(); throw error; }
    finally { conn.release(); }
};
