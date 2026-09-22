import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { generateReferenceNumber } from '../utils/otp.js';

export const getWallet = async (userId) => {
    const [rows] = await pool.execute(`SELECT wallet_balance FROM users WHERE id = ?`, [userId]);
    if (!rows.length) throw new ApiError(404, 'User not found');
    return { userId, balance: Number(rows[0].wallet_balance) };
};

export const listTransactions = async (userId, { limit = 50 } = {}) => {
    const [rows] = await pool.execute(
        `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, Number(limit)]
    );
    return rows;
};

/**
 * Atomically credit or debit a wallet.
 * type: 'CREDIT' | 'DEBIT'
 */
export const adjustWallet = async ({ userId, amount, type, reason, referenceType = null, referenceId = null }) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) throw new ApiError(400, 'Amount must be greater than 0');
    if (!['CREDIT', 'DEBIT'].includes(type)) throw new ApiError(400, 'Invalid type');

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [userRows] = await conn.execute(
            `SELECT wallet_balance, role FROM users WHERE id = ? FOR UPDATE`,
            [userId]
        );
        if (!userRows.length) throw new ApiError(404, 'User not found');

        const current = Number(userRows[0].wallet_balance);
        const isDriver = userRows[0].role === 'DRIVER';
        let newBalance;

        if (type === 'CREDIT') {
            newBalance = current + amt;
        } else {
            if (current < amt) throw new ApiError(400, 'Insufficient wallet balance');
            newBalance = current - amt;
        }

        // Drivers also have a wallet_balance column on the drivers table — keep it in sync.
        await conn.execute(`UPDATE users SET wallet_balance = ? WHERE id = ?`, [newBalance, userId]);
        if (isDriver) {
            await conn.execute(`UPDATE drivers SET wallet_balance = ? WHERE user_id = ?`, [newBalance, userId]);
        }

        const [tx] = await conn.execute(
            `INSERT INTO wallet_transactions
             (user_id, amount, type, reason, reference_type, reference_id, balance_after)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, amt, type, reason, referenceType, referenceId, newBalance]
        );

        await conn.commit();
        return { balance: newBalance, transactionId: tx.insertId, reference: generateReferenceNumber('WLT') };
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
};

export const topupWallet = async ({ userId, amount, paymentId = null }) =>
    adjustWallet({
        userId,
        amount,
        type: 'CREDIT',
        reason: 'TOPUP',
        referenceType: paymentId ? 'PAYMENT' : null,
        referenceId: paymentId,
    });
