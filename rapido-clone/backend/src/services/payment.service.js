import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../config/DBconfig/database.js';
import envConfig from '../config/envConfig.js';
import { ApiError } from '../utils/apiError.js';
import { adjustWallet } from './wallet.service.js';

let _rzp = null;
const getRzp = () => {
    if (_rzp) return _rzp;
    if (!envConfig.RAZORPAY_KEY_ID || envConfig.RAZORPAY_KEY_ID.includes('REPLACE_ME')) {
        throw new ApiError(503, 'Razorpay is not configured on this server');
    }
    _rzp = new Razorpay({
        key_id: envConfig.RAZORPAY_KEY_ID,
        key_secret: envConfig.RAZORPAY_KEY_SECRET,
    });
    return _rzp;
};

export const isRazorpayEnabled = () =>
    !!envConfig.RAZORPAY_KEY_ID && !envConfig.RAZORPAY_KEY_ID.includes('REPLACE_ME');

/**
 * Create a Razorpay order for a ride payment or wallet topup.
 * purpose: 'RIDE' | 'TOPUP'
 */
export const createOrder = async ({ userId, amount, purpose = 'RIDE', rideId = null, notes = {} }) => {
    const rzp = getRzp();
    const amountPaise = Math.round(Number(amount) * 100);
    if (!amountPaise || amountPaise < 100) throw new ApiError(400, 'Amount must be at least ₹1');

    const order = await rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${userId}`,
        notes: { userId: String(userId), purpose, rideId: rideId ? String(rideId) : '', ...notes },
    });

    const [r] = await pool.execute(
        `INSERT INTO payments (ride_id, user_id, amount, method, status, gateway_order_id)
         VALUES (?, ?, ?, 'RAZORPAY', 'INITIATED', ?)`,
        [rideId, userId, amount, order.id]
    );

    return {
        paymentId: r.insertId,
        orderId: order.id,
        amount,
        amountPaise,
        currency: 'INR',
        keyId: envConfig.RAZORPAY_KEY_ID,
    };
};

export const verifySignature = ({ orderId, paymentId, signature }) => {
    const expected = crypto
        .createHmac('sha256', envConfig.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    return expected === signature;
};

export const verifyPayment = async ({ userId, orderId, razorpayPaymentId, signature, creditWallet = false }) => {
    if (!verifySignature({ orderId, paymentId: razorpayPaymentId, signature })) {
        await pool.execute(
            `UPDATE payments SET status = 'FAILED', failure_reason = 'Signature mismatch' WHERE gateway_order_id = ?`,
            [orderId]
        );
        throw new ApiError(400, 'Payment signature verification failed');
    }

    const [rows] = await pool.execute(
        `SELECT * FROM payments WHERE gateway_order_id = ? AND user_id = ? LIMIT 1`,
        [orderId, userId]
    );
    if (!rows.length) throw new ApiError(404, 'Payment record not found');
    const payment = rows[0];

    await pool.execute(
        `UPDATE payments
         SET status = 'SUCCESS', gateway_payment_id = ?, gateway_signature = ?, paid_at = NOW()
         WHERE id = ?`,
        [razorpayPaymentId, signature, payment.id]
    );

    // If ride payment, mark ride paid.
    if (payment.ride_id) {
        await pool.execute(
            `UPDATE rides SET payment_method = 'ONLINE', payment_status = 'PAID' WHERE id = ?`,
            [payment.ride_id]
        );
    }

    // If topup, credit wallet.
    if (creditWallet) {
        await adjustWallet({
            userId,
            amount: Number(payment.amount),
            type: 'CREDIT',
            reason: 'TOPUP',
            referenceType: 'PAYMENT',
            referenceId: payment.id,
        });
    }

    return { success: true, paymentId: payment.id };
};

export const recordCashPayment = async ({ rideId, userId, amount }) => {
    const [r] = await pool.execute(
        `INSERT INTO payments (ride_id, user_id, amount, method, status, paid_at)
         VALUES (?, ?, ?, 'CASH', 'SUCCESS', NOW())`,
        [rideId, userId, amount]
    );
    await pool.execute(
        `UPDATE rides SET payment_method = 'CASH', payment_status = 'PAID' WHERE id = ?`,
        [rideId]
    );
    return { paymentId: r.insertId };
};

export const recordWalletPayment = async ({ rideId, userId, amount }) => {
    await adjustWallet({
        userId,
        amount,
        type: 'DEBIT',
        reason: 'RIDE_PAYMENT',
        referenceType: 'RIDE',
        referenceId: rideId,
    });
    const [r] = await pool.execute(
        `INSERT INTO payments (ride_id, user_id, amount, method, status, paid_at)
         VALUES (?, ?, ?, 'WALLET', 'SUCCESS', NOW())`,
        [rideId, userId, amount]
    );
    await pool.execute(
        `UPDATE rides SET payment_method = 'WALLET', payment_status = 'PAID' WHERE id = ?`,
        [rideId]
    );
    return { paymentId: r.insertId };
};

export const refundPayment = async ({ paymentId, amount, reason = 'User request' }) => {
    const [rows] = await pool.execute(`SELECT * FROM payments WHERE id = ?`, [paymentId]);
    if (!rows.length) throw new ApiError(404, 'Payment not found');
    const payment = rows[0];
    const refundAmt = Number(amount || payment.amount);

    if (payment.method === 'RAZORPAY' && isRazorpayEnabled() && payment.gateway_payment_id) {
        try {
            await getRzp().payments.refund(payment.gateway_payment_id, {
                amount: Math.round(refundAmt * 100),
                notes: { reason },
            });
        } catch (e) {
            throw new ApiError(502, `Razorpay refund failed: ${e.message}`);
        }
    } else if (payment.method === 'WALLET') {
        await adjustWallet({
            userId: payment.user_id,
            amount: refundAmt,
            type: 'CREDIT',
            reason: 'REFUND',
            referenceType: 'PAYMENT',
            referenceId: payment.id,
        });
    }

    await pool.execute(
        `UPDATE payments SET status = 'REFUNDED', refund_amount = ?, failure_reason = ? WHERE id = ?`,
        [refundAmt, reason, paymentId]
    );
    if (payment.ride_id) {
        await pool.execute(`UPDATE rides SET payment_status = 'REFUNDED' WHERE id = ?`, [payment.ride_id]);
    }
    return { success: true, refundAmt };
};

export const listPaymentsForUser = async (userId, { limit = 50 } = {}) => {
    const [rows] = await pool.execute(
        `SELECT p.*, r.pickup_address, r.dropoff_address, r.vehicle_type, r.status AS ride_status
         FROM payments p LEFT JOIN rides r ON r.id = p.ride_id
         WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT ?`,
        [userId, Number(limit)]
    );
    return rows;
};

export const listAllPayments = async ({ status, method, limit = 200, offset = 0 } = {}) => {
    const where = [];
    const params = [];
    if (status) {
        where.push(`p.status = ?`);
        params.push(status);
    }
    if (method) {
        where.push(`p.method = ?`);
        params.push(method);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
        `SELECT p.*, u.name AS user_name, u.phone AS user_phone,
                r.pickup_address, r.dropoff_address, r.vehicle_type
         FROM payments p
         JOIN users u ON u.id = p.user_id
         LEFT JOIN rides r ON r.id = p.ride_id
         ${whereSql}
         ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );
    return rows;
};

export const getPayment = async (id) => {
    const [rows] = await pool.execute(`SELECT * FROM payments WHERE id = ?`, [id]);
    return rows[0] || null;
};
