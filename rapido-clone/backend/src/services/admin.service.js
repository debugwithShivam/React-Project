import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';

// ============================================================
// Dashboard
// ============================================================
export const getDashboardStats = async () => {
    const [[stats]] = await pool.execute(
        `SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'USER') AS users,
            (SELECT COUNT(*) FROM users WHERE role = 'USER' AND DATE(created_at) = CURDATE()) AS new_users_today,
            (SELECT COUNT(*) FROM drivers) AS drivers,
            (SELECT COUNT(*) FROM drivers WHERE status = 'APPROVED') AS approved_drivers,
            (SELECT COUNT(*) FROM drivers WHERE status = 'PENDING') AS pending_drivers,
            (SELECT COUNT(*) FROM drivers WHERE is_online = TRUE) AS online_drivers,
            (SELECT COUNT(*) FROM rides WHERE DATE(created_at) = CURDATE()) AS rides_today,
            (SELECT COUNT(*) FROM rides WHERE status IN ('SEARCHING','ACCEPTED','ARRIVING','STARTED')) AS active_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'COMPLETED') AS completed_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'CANCELLED') AS cancelled_rides,
            (SELECT COALESCE(SUM(final_fare), 0) FROM rides WHERE status = 'COMPLETED') AS revenue,
            (SELECT COALESCE(SUM(commission_amount), 0) FROM rides WHERE status = 'COMPLETED') AS commission,
            (SELECT COALESCE(SUM(driver_earnings), 0) FROM rides WHERE status = 'COMPLETED') AS driver_payouts,
            (SELECT COUNT(*) FROM complaints WHERE status = 'OPEN') AS open_complaints,
            (SELECT COUNT(*) FROM payouts WHERE status = 'REQUESTED') AS pending_payouts,
            (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE status = 'REQUESTED') AS pending_payout_amount`
    );

    const [ridesByDay] = await pool.execute(
        `SELECT DATE(created_at) AS day,
                COUNT(*) AS rides,
                COALESCE(SUM(CASE WHEN status='COMPLETED' THEN final_fare ELSE 0 END),0) AS revenue
         FROM rides
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY DATE(created_at) ORDER BY day DESC`
    );

    const [ridesByStatus] = await pool.execute(
        `SELECT status, COUNT(*) AS n FROM rides GROUP BY status`
    );

    const [topDrivers] = await pool.execute(
        `SELECT d.id, d.vehicle_plate, u.name, d.total_rides, d.total_earnings, d.rating_avg
         FROM drivers d JOIN users u ON u.id = d.user_id
         WHERE d.status = 'APPROVED'
         ORDER BY d.total_rides DESC LIMIT 5`
    );

    return { ...stats, ridesByDay, ridesByStatus, topDrivers };
};

// ============================================================
// Drivers (KYC queue)
// ============================================================
export const listDrivers = async ({ status, city, search, limit = 200, offset = 0 } = {}) => {
    const where = [];
    const params = [];
    if (status) {
        where.push(`d.status = ?`);
        params.push(status);
    }
    if (city) {
        where.push(`d.city = ?`);
        params.push(city);
    }
    if (search) {
        where.push(`(u.name LIKE ? OR u.phone LIKE ? OR d.vehicle_plate LIKE ?)`);
        const s = `%${search}%`;
        params.push(s, s, s);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
        `SELECT d.*, u.name, u.phone, u.email, u.is_active, u.profile_image,
                COUNT(dd.id) AS document_count,
                SUM(dd.verification_status = 'PENDING') AS pending_document_count
         FROM drivers d
         JOIN users u ON u.id = d.user_id
         LEFT JOIN driver_documents dd ON dd.driver_id = d.id
         ${whereSql}
         GROUP BY d.id ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );
    return rows;
};

export const getDriverDetails = async (driverId) => {
    const [drivers] = await pool.execute(
        `SELECT d.*, u.name, u.phone, u.email, u.is_active, u.profile_image, u.rating_avg AS user_rating
         FROM drivers d JOIN users u ON u.id = d.user_id WHERE d.id = ?`,
        [driverId]
    );
    if (!drivers.length) return null;
    const [documents] = await pool.execute(
        `SELECT id, document_type, document_side, file_name, verification_status, created_at, updated_at
         FROM driver_documents WHERE driver_id = ? ORDER BY document_type, document_side`,
        [driverId]
    );
    const [rides] = await pool.execute(
        `SELECT id, status, final_fare, created_at, pickup_address, dropoff_address FROM rides WHERE driver_id = ? ORDER BY created_at DESC LIMIT 10`,
        [driverId]
    );
    return { ...drivers[0], documents, recentRides: rides };
};

export const reviewDriver = async ({ driverId, status, rejectionReason = null }) => {
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status))
        throw new ApiError(400, 'Invalid driver status');
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [result] = await conn.execute(
            `UPDATE drivers SET status = ?, rejection_reason = ? WHERE id = ?`,
            [status, status === 'REJECTED' ? rejectionReason : null, driverId]
        );
        if (!result.affectedRows) {
            await conn.rollback();
            return null;
        }
        const documentStatus =
            status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING';
        await conn.execute(
            `UPDATE driver_documents SET verification_status = ? WHERE driver_id = ?`,
            [documentStatus, driverId]
        );

        // Notify driver via users table.
        const [d] = await conn.execute(`SELECT user_id FROM drivers WHERE id = ?`, [driverId]);
        if (d.length) {
            const title =
                status === 'APPROVED'
                    ? 'Driver account approved'
                    : status === 'REJECTED'
                      ? 'Driver account rejected'
                      : 'Driver account under review';
            const body =
                status === 'APPROVED'
                    ? 'Congratulations! You can now go online and accept rides.'
                    : status === 'REJECTED'
                      ? `Your application was rejected. ${rejectionReason || ''}`.trim()
                      : 'Your documents are being reviewed.';
            await conn.execute(
                `INSERT INTO notifications (user_id, title, body, type, data_json) VALUES (?, ?, ?, 'KYC', ?)`,
                [d[0].user_id, title, body, JSON.stringify({ driverId, status })]
            );
        }

        await conn.commit();
        return getDriverDetails(driverId);
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
};

export const reviewDocument = async ({ documentId, status }) => {
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status))
        throw new ApiError(400, 'Invalid status');
    await pool.execute(`UPDATE driver_documents SET verification_status = ? WHERE id = ?`, [
        status,
        documentId,
    ]);
};

export const getDocumentBlob = async (documentId) => {
    const [rows] = await pool.execute(
        `SELECT file_data, file_name FROM driver_documents WHERE id = ?`,
        [documentId]
    );
    return rows[0] || null;
};

// ============================================================
// Rides
// ============================================================
export const listAllRides = async ({ status, from, to, search, limit = 200, offset = 0 } = {}) => {
    const where = [];
    const params = [];
    if (status) {
        where.push(`r.status = ?`);
        params.push(status);
    }
    if (from) {
        where.push(`r.created_at >= ?`);
        params.push(from);
    }
    if (to) {
        where.push(`r.created_at <= ?`);
        params.push(to);
    }
    if (search) {
        where.push(`(rider.name LIKE ? OR rider.phone LIKE ? OR r.pickup_address LIKE ? OR r.dropoff_address LIKE ?)`);
        const s = `%${search}%`;
        params.push(s, s, s, s);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
        `SELECT r.*, rider.name AS rider_name, rider.phone AS rider_phone,
                driver.name AS driver_name, driver.phone AS driver_phone, d.vehicle_plate, d.id AS driver_id
         FROM rides r
         JOIN users rider ON rider.id = r.user_id
         LEFT JOIN drivers d ON d.id = r.driver_id
         LEFT JOIN users driver ON driver.id = d.user_id
         ${whereSql}
         ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );
    return rows;
};

export const adminCancelRide = async ({ rideId, reason = 'Cancelled by admin' }) => {
    const [rows] = await pool.execute(`SELECT * FROM rides WHERE id = ?`, [rideId]);
    if (!rows.length) throw new ApiError(404, 'Ride not found');
    if (['COMPLETED', 'CANCELLED'].includes(rows[0].status))
        throw new ApiError(409, `Cannot cancel ride in ${rows[0].status} state`);
    await pool.execute(
        `UPDATE rides SET status = 'CANCELLED', cancelled_at = NOW(), cancelled_by = 'ADMIN', cancellation_reason = ? WHERE id = ?`,
        [reason, rideId]
    );
    return { rideId, status: 'CANCELLED', reason };
};

export const getRideDetail = async (rideId) => {
    const [rows] = await pool.execute(
        `SELECT r.*, rider.name AS rider_name, rider.phone AS rider_phone,
                driver.name AS driver_name, driver.phone AS driver_phone, d.vehicle_plate
         FROM rides r JOIN users rider ON rider.id = r.user_id
         LEFT JOIN drivers d ON d.id = r.driver_id
         LEFT JOIN users driver ON driver.id = d.user_id
         WHERE r.id = ?`,
        [rideId]
    );
    if (!rows.length) return null;
    const [events] = await pool.execute(`SELECT * FROM ride_events WHERE ride_id = ? ORDER BY created_at`, [rideId]);
    const [payments] = await pool.execute(`SELECT * FROM payments WHERE ride_id = ?`, [rideId]);
    const [ratings] = await pool.execute(`SELECT * FROM ratings WHERE ride_id = ?`, [rideId]);
    return { ...rows[0], events, payments, ratings };
};

// ============================================================
// Users (customers)
// ============================================================
export const listUsers = async ({ role, search, isActive, limit = 200, offset = 0 } = {}) => {
    const where = [];
    const params = [];
    if (role) {
        where.push(`role = ?`);
        params.push(role);
    }
    if (search) {
        where.push(`(name LIKE ? OR phone LIKE ? OR email LIKE ?)`);
        const s = `%${search}%`;
        params.push(s, s, s);
    }
    if (isActive !== undefined && isActive !== null && isActive !== '') {
        where.push(`is_active = ?`);
        params.push(isActive === 'true' || isActive === true || isActive === 1 || isActive === '1');
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
        `SELECT id, name, phone, email, role, profile_image, is_active, wallet_balance,
                rating_avg, rating_count, city, created_at
         FROM users ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );
    return rows;
};

export const getUserDetail = async (userId) => {
    const [u] = await pool.execute(
        `SELECT id, name, phone, email, role, profile_image, is_active, wallet_balance,
                rating_avg, rating_count, referral_code, city, created_at FROM users WHERE id = ?`,
        [userId]
    );
    if (!u.length) throw new ApiError(404, 'User not found');
    const [rides] = await pool.execute(
        `SELECT id, status, vehicle_type, final_fare, created_at, pickup_address, dropoff_address
         FROM rides WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
        [userId]
    );
    const [complaints] = await pool.execute(
        `SELECT id, subject, status, created_at FROM complaints WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
        [userId]
    );
    return { ...u[0], rides, complaints };
};

export const toggleUserActive = async (userId, isActive) => {
    await pool.execute(`UPDATE users SET is_active = ? WHERE id = ?`, [!!isActive, userId]);
    return { userId, isActive: !!isActive };
};

export const adminUpdateUser = async (userId, patch) => {
    const allowed = ['name', 'phone', 'email', 'role', 'city', 'is_active'];
    const fields = [];
    const params = [];
    for (const k of allowed) {
        if (k in patch) {
            fields.push(`${k} = ?`);
            params.push(patch[k]);
        }
    }
    if (!fields.length) return getUserDetail(userId);
    params.push(userId);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    return getUserDetail(userId);
};

export const adjustUserWallet = async ({ userId, amount, type, reason }) => {
    const { adjustWallet } = await import('./wallet.service.js');
    return adjustWallet({ userId, amount, type, reason, referenceType: 'ADMIN' });
};

// ============================================================
// Revenue / Reports
// ============================================================
export const getRevenueReport = async ({ from, to, groupBy = 'day' } = {}) => {
    const fmt = groupBy === 'month' ? '%Y-%m' : groupBy === 'week' ? '%Y-%u' : '%Y-%m-%d';
    const params = [];
    let dateClause = '';
    if (from && to) {
        dateClause = `WHERE completed_at BETWEEN ? AND ?`;
        params.push(from, to);
    } else if (from) {
        dateClause = `WHERE completed_at >= ?`;
        params.push(from);
    }
    const [rows] = await pool.execute(
        `SELECT DATE_FORMAT(completed_at, '${fmt}') AS period,
                COUNT(*) AS rides,
                COALESCE(SUM(final_fare),0) AS gross,
                COALESCE(SUM(commission_amount),0) AS commission,
                COALESCE(SUM(driver_earnings),0) AS driver_payout
         FROM rides
         ${dateClause} ${dateClause ? 'AND' : 'WHERE'} status = 'COMPLETED'
         GROUP BY period ORDER BY period DESC`,
        params
    );
    return rows;
};

export const getRidesByStatus = async () => {
    const [rows] = await pool.execute(`SELECT status, COUNT(*) AS n FROM rides GROUP BY status`);
    return rows;
};
