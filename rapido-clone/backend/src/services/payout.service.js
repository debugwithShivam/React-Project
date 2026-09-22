import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { getSetting } from './settings.service.js';
import { createNotification } from './notification.service.js';
import { adjustWallet } from './wallet.service.js';

export const requestPayout = async ({ driverUserId, amount, upi }) => {
    const [dRows] = await pool.execute(
        `SELECT d.*, u.name FROM drivers d JOIN users u ON u.id = d.user_id WHERE d.user_id = ? AND d.status = 'APPROVED'`,
        [driverUserId]
    );
    if (!dRows.length) throw new ApiError(403, 'Only approved drivers can request payouts');
    const driver = dRows[0];

    const min = Number(await getSetting('min_payout_amount', 250));
    if (Number(amount) < min) throw new ApiError(400, `Minimum payout is ₹${min}`);
    if (Number(amount) > Number(driver.wallet_balance))
        throw new ApiError(400, 'Amount exceeds wallet balance');

    const finalUpi = upi || driver.payout_upi;
    if (!finalUpi) throw new ApiError(400, 'UPI id required');

    const [r] = await pool.execute(
        `INSERT INTO payouts (driver_id, amount, upi) VALUES (?, ?, ?)`,
        [driver.id, amount, finalUpi]
    );

    // Reserve balance: debit from driver wallet now. Refund if rejected.
    await adjustWallet({
        userId: driverUserId,
        amount,
        type: 'DEBIT',
        reason: 'PAYOUT_REQUEST',
        referenceType: 'PAYOUT',
        referenceId: r.insertId,
    });

    const [rows] = await pool.execute(`SELECT * FROM payouts WHERE id = ?`, [r.insertId]);
    return rows[0];
};

export const listPayoutsForDriver = async (driverUserId) => {
    const [rows] = await pool.execute(
        `SELECT p.* FROM payouts p JOIN drivers d ON d.id = p.driver_id WHERE d.user_id = ? ORDER BY p.requested_at DESC`,
        [driverUserId]
    );
    return rows;
};

export const listAllPayouts = async ({ status, limit = 200, offset = 0 } = {}) => {
    const where = status ? `WHERE p.status = ?` : '';
    const params = status ? [status, Number(limit), Number(offset)] : [Number(limit), Number(offset)];
    const [rows] = await pool.execute(
        `SELECT p.*, d.vehicle_plate, u.name AS driver_name, u.phone AS driver_phone
         FROM payouts p
         JOIN drivers d ON d.id = p.driver_id
         JOIN users u ON u.id = d.user_id
         ${where}
         ORDER BY p.requested_at DESC LIMIT ? OFFSET ?`,
        params
    );
    return rows;
};

export const processPayout = async ({ payoutId, status, adminId, notes = null, referenceNumber = null }) => {
    if (!['PROCESSING', 'PAID', 'REJECTED'].includes(status))
        throw new ApiError(400, 'Invalid status');

    const [rows] = await pool.execute(
        `SELECT p.*, u.id AS user_id FROM payouts p JOIN drivers d ON d.id = p.driver_id JOIN users u ON u.id = d.user_id WHERE p.id = ?`,
        [payoutId]
    );
    if (!rows.length) throw new ApiError(404, 'Payout not found');
    const payout = rows[0];
    if (payout.status === 'PAID' || payout.status === 'REJECTED')
        throw new ApiError(400, `Payout already ${payout.status.toLowerCase()}`);

    await pool.execute(
        `UPDATE payouts SET status = ?, processed_at = NOW(), processed_by = ?, notes = ?, reference_number = COALESCE(?, reference_number) WHERE id = ?`,
        [status, adminId, notes, referenceNumber, payoutId]
    );

    if (status === 'REJECTED') {
        // Refund the reserved amount back to wallet.
        await adjustWallet({
            userId: payout.user_id,
            amount: Number(payout.amount),
            type: 'CREDIT',
            reason: 'PAYOUT_REJECTED_REFUND',
            referenceType: 'PAYOUT',
            referenceId: payoutId,
        });
    }

    await createNotification({
        userId: payout.user_id,
        title: `Payout ${status.toLowerCase()}`,
        body:
            status === 'PAID'
                ? `₹${payout.amount} has been sent to ${payout.upi}.`
                : status === 'REJECTED'
                  ? `Your payout of ₹${payout.amount} was rejected. ${notes || ''}`.trim()
                  : `Your payout of ₹${payout.amount} is being processed.`,
        type: 'PAYOUT',
        data: { payoutId, status },
    });

    const [updated] = await pool.execute(`SELECT * FROM payouts WHERE id = ?`, [payoutId]);
    return updated[0];
};
