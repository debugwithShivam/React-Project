import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { calculateFare } from '../utils/fare.js';
import { emitToUser, emitToRide, emitToAdmins } from '../socket/index.js';
import { createNotification } from './notification.service.js';
import { dispatchRideRequests } from './driver.service.js';
import { validateCoupon, redeemCoupon } from './coupon.service.js';
import { getSetting } from './settings.service.js';
import { recordCashPayment, recordWalletPayment } from './payment.service.js';

export const estimateFare = async ({ pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType }) => {
    return calculateFare({ vehicleType, pickupLat, pickupLng, dropoffLat, dropoffLng });
};

export const estimateAllVehicles = async ({ pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
    const [vts] = await pool.execute(`SELECT code FROM vehicle_types WHERE is_active = TRUE ORDER BY sort_order`);
    const out = [];
    for (const v of vts) {
        out.push(await calculateFare({ vehicleType: v.code, pickupLat, pickupLng, dropoffLat, dropoffLng }));
    }
    return out;
};

export const createRide = async ({
    userId,
    pickupAddress,
    pickupLat,
    pickupLng,
    dropoffAddress,
    dropoffLat,
    dropoffLng,
    vehicleType,
    estimatedFare = null,
    paymentMethod = 'CASH',
    couponCode = null,
    scheduledAt = null,
}) => {
    const est = await calculateFare({ vehicleType, pickupLat, pickupLng, dropoffLat, dropoffLng });
    const finalEstimated = Number(estimatedFare || est.totalFare);

    let couponId = null;
    let discount = 0;
    if (couponCode) {
        const v = await validateCoupon({
            code: couponCode,
            userId,
            fare: finalEstimated,
            vehicleType,
            role: 'USER',
        });
        couponId = v.coupon.id;
        discount = v.discount;
    }

    const isScheduled = !!scheduledAt && new Date(scheduledAt) > new Date();
    const initialStatus = isScheduled ? 'SCHEDULED' : 'SEARCHING';

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [r] = await conn.execute(
            `INSERT INTO rides
             (user_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng,
              vehicle_type, status, estimated_fare, distance_km, duration_min, payment_method,
              coupon_id, discount_amount, scheduled_at, is_scheduled)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                pickupAddress,
                pickupLat,
                pickupLng,
                dropoffAddress,
                dropoffLat,
                dropoffLng,
                vehicleType,
                initialStatus,
                finalEstimated,
                est.distanceKm,
                est.durationMin,
                paymentMethod,
                couponId,
                discount,
                scheduledAt,
                isScheduled,
            ]
        );

        const rideId = r.insertId;

        await conn.execute(
            `INSERT INTO ride_events (ride_id, event_type, payload_json) VALUES (?, 'CREATED', ?)`,
            [rideId, JSON.stringify({ initialStatus, estimatedFare: finalEstimated, discount })]
        );

        await conn.commit();

        // Coupon redemption is independent — keep outside the ride txn so a
        // coupon failure does not void the created ride.
        let redeemed = false;
        if (couponId) {
            try {
                await redeemCoupon({ couponId, userId, rideId, discount });
                redeemed = true;
            } catch (e) {
                console.error('[createRide] coupon redemption failed', e.message);
            }
        }

        emitToAdmins('admin:ride-created', { rideId, status: initialStatus });

        if (!isScheduled) {
            dispatchRideRequests(rideId).catch((e) => console.error('[dispatch]', e.message));
        }

        const [rows] = await pool.execute(`SELECT * FROM rides WHERE id = ?`, [rideId]);
        const ride = decor
};

export const getRideById = async (rideId) => {
    const [rows] = await pool.execute(
        `SELECT r.*,
                u.name AS user_name, u.phone AS user_phone, u.rating_avg AS user_rating,
                d.id AS driver_id, d.vehicle_type AS driver_vehicle_type, d.vehicle_model, d.vehicle_plate,
                d.rating_avg AS driver_rating, d.total_rides AS driver_total_rides,
                d.current_lat AS driver_lat, d.current_lng AS driver_lng,
                du.id AS driver_user_id, du.name AS driver_name, du.phone AS driver_phone, du.profile_image AS driver_image
         FROM rides r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN drivers d ON d.id = r.driver_id
         LEFT JOIN users du ON du.id = d.user_id
         WHERE r.id = ? LIMIT 1`,
        [rideId]
    );
    const row = rows[0];
    if (!row) return null;
    return decorateRide(row);
};

// Attach nested `driver` / `user` objects and a `ride_otp` alias so the mobile
// apps (which expect a nested shape) render the driver card, OTP and passenger.
export const decorateRide = (row) => {
    if (!row) return row;
    const out = { ...row };
    out.ride_otp = row.start_otp ?? row.ride_otp ?? null;
    out.user = {
        id: row.user_id,
        name: row.user_name ?? null,
        phone: row.user_phone ?? null,
        rating: row.user_rating != null ? Number(row.user_rating) : null,
    };
    out.driver = row.driver_id
        ? {
              id: row.driver_id,
              userId: row.driver_user_id ?? null,
              name: row.driver_name ?? null,
              phone: row.driver_phone ?? null,
              profileImage: row.driver_image ?? null,
              rating: row.driver_rating != null ? Number(row.driver_rating) : null,
              total_rides: row.driver_total_rides ?? 0,
              vehicle_type: row.driver_vehicle_type ?? row.vehicle_type ?? null,
              vehicle_model: row.vehicle_model ?? null,
              vehicle_plate: row.vehicle_plate ?? null,
              current_lat: row.driver_lat != null ? Number(row.driver_lat) : null,
              current_lng: row.driver_lng != null ? Number(row.driver_lng) : null,
          }
        : null;
    return out;
};

export const getRidesForUser = async (userId, { status = null, limit = 50 } = {}) => {
    const where = status ? `AND r.status = ?` : '';
    const params = status ? [userId, status, Number(limit)] : [userId, Number(limit)];
    const [rows] = await pool.execute(
        `SELECT r.*, d.vehicle_model, d.vehicle_plate, du.name AS driver_name, du.phone AS driver_phone,
                du.profile_image AS driver_image, d.rating_avg AS driver_rating
         FROM rides r
         LEFT JOIN drivers d ON d.id = r.driver_id
         LEFT JOIN users du ON du.id = d.user_id
         WHERE r.user_id = ? ${where}
         ORDER BY r.created_at DESC LIMIT ?`,
        params
    );
    return rows;
};

export const getActiveRideForUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM rides WHERE user_id = ? AND status IN ('SEARCHING','ACCEPTED','ARRIVING','STARTED')
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );
    return rows[0] || null;
};

export const getActiveRideForDriver = async (driverUserId) => {
    const [d] = await pool.execute(`SELECT id FROM drivers WHERE user_id = ?`, [driverUserId]);
    if (!d.length) return null;
    const [rows] = await pool.execute(
        `SELECT r.*,
                u.name AS user_name, u.phone AS user_phone, u.rating_avg AS user_rating,
                dr.vehicle_model, dr.vehicle_plate, dr.rating_avg AS driver_rating,
                dr.total_rides AS driver_total_rides, dr.current_lat AS driver_lat, dr.current_lng AS driver_lng,
                du.id AS driver_user_id, du.name AS driver_name, du.phone AS driver_phone, du.profile_image AS driver_image,
                dr.id AS driver_id, dr.vehicle_type AS driver_vehicle_type
         FROM rides r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN drivers dr ON dr.id = r.driver_id
         LEFT JOIN users du ON du.id = dr.user_id
         WHERE r.driver_id = ? AND r.status IN ('ACCEPTED','ARRIVING','STARTED')
         ORDER BY r.accepted_at DESC LIMIT 1`,
        [d[0].id]
    );
    return rows[0] ? decorateRide(rows[0]) : null;
};

export const cancelRide = async (rideId, userId, { reason = null } = {}) => {
    const ride = await getRideById(rideId);
    if (!ride) throw new ApiError(404, 'Ride not found');
    if (Number(ride.user_id) !== Number(userId)) throw new ApiError(403, 'Not your ride');
    if (!['SEARCHING', 'ACCEPTED', 'ARRIVING'].includes(ride.status))
        throw new ApiError(409, `Ride cannot be cancelled in ${ride.status} state`);

    // Compute cancellation charges.
    let charges = 0;
    if (ride.status === 'ACCEPTED' || ride.status === 'ARRIVING') {
        const freeMin = Number(await getSetting('cancellation_free_minutes', 3));
        const acceptedAt = ride.accepted_at ? new Date(ride.accepted_at) : null;
        const elapsedMin = acceptedAt ? (Date.now() - acceptedAt.getTime()) / 60000 : 999;
        if (elapsedMin > freeMin) {
            const [vt] = await pool.execute(
                `SELECT cancellation_fee FROM vehicle_types WHERE code = UPPER(?) LIMIT 1`,
                [ride.vehicle_type]
            );
            charges = vt.length ? Number(vt[0].cancellation_fee) : 10;
        }
    }

    await pool.execute(
        `UPDATE rides SET status = 'CANCELLED', cancelled_at = NOW(), cancelled_by = 'USER',
                cancellation_reason = ?, cancellation_charges = ? WHERE id = ?`,
        [reason, charges, rideId]
    );
    await pool.execute(
        `INSERT INTO ride_events (ride_id, driver_id, event_type, payload_json) VALUES (?, ?, 'CANCELLED_BY_USER', ?)`,
        [rideId, ride.driver_id, JSON.stringify({ reason, charges })]
    );

    if (ride.driver_id) {
        const [d] = await pool.execute(`SELECT user_id FROM drivers WHERE id = ?`, [ride.driver_id]);
        if (d.length) {
            emitToUser(d[0].user_id, 'ride:cancelled-by-user', { rideId, reason });
            await createNotification({
                userId: d[0].user_id,
                title: 'Ride cancelled',
                body: charges > 0 ? `Rider cancelled. ₹${charges} will be credited to your wallet.` : 'Rider cancelled this ride.',
                type: 'RIDE',
                data: { rideId },
            });
            if (charges > 0) {
                // Credit driver as compensation.
                try {
                    const { adjustWallet } = await import('./wallet.service.js');
                    await adjustWallet({
                        userId: d[0].user_id,
                        amount: charges,
                        type: 'CREDIT',
                        reason: 'CANCELLATION_COMPENSATION',
                        referenceType: 'RIDE',
                        referenceId: rideId,
                    });
                } catch {}
            }
        }
    }

    const payload = { rideId, status: 'CANCELLED', by: 'USER', charges };
    emitToRide(rideId, 'ride:status', payload);
    emitToAdmins('admin:ride-updated', payload);
    return payload;
};

export const getRideReceipt = async (rideId, userId) => {
    const ride = await getRideById(rideId);
    if (!ride) throw new ApiError(404, 'Ride not found');
    if (Number(ride.user_id) !== Number(userId)) {
        // Allow driver too.
        const [d] = await pool.execute(`SELECT user_id FROM drivers WHERE id = ?`, [ride.driver_id || 0]);
        if (!d.length || Number(d[0].user_id) !== Number(userId))
            throw new ApiError(403, 'Not your ride');
    }
    const [payments] = await pool.execute(`SELECT * FROM payments WHERE ride_id = ?`, [rideId]);
    const [ratings] = await pool.execute(`SELECT * FROM ratings WHERE ride_id = ?`, [rideId]);
    return { ride, payments, ratings };
};

export const contactDriver = async (rideId, userId) => {
    const ride = await getRideById(rideId);
    if (!ride || Number(ride.user_id) !== Number(userId)) throw new ApiError(403, 'Not your ride');
    if (!ride.driver_phone) throw new ApiError(400, 'No driver assigned yet');
    return { driverName: ride.driver_name, driverPhone: ride.driver_phone };
};

export const triggerSos = async ({ rideId, userId, lat = null, lng = null }) => {
    const ride = await getRideById(rideId);
    if (!ride || Number(ride.user_id) !== Number(userId)) throw new ApiError(403, 'Not your ride');

    await pool.execute(`UPDATE rides SET is_sos = TRUE WHERE id = ?`, [rideId]);
    const [r] = await pool.execute(
        `INSERT INTO sos_alerts (ride_id, user_id, lat, lng) VALUES (?, ?, ?, ?)`,
        [rideId, userId, lat || ride.pickup_lat, lng || ride.pickup_lng]
    );

    emitToAdmins('admin:sos', { sosId: r.insertId, rideId, userId, lat, lng });
    if (ride.driver_id) {
        const [d] = await pool.execute(`SELECT user_id FROM drivers WHERE id = ?`, [ride.driver_id]);
        if (d.length) emitToUser(d[0].user_id, 'ride:sos', { rideId });
    }
    await createNotification({
        userId,
        title: 'SOS activated',
        body: 'Our safety team has been alerted and is reviewing your ride.',
        type: 'SOS',
        data: { rideId, sosId: r.insertId },
    });
    return { sosId: r.insertId };
};

export const getShareRideLink = async (rideId, userId) => {
    const ride = await getRideById(rideId);
    if (!ride || Number(ride.user_id) !== Number(userId)) throw new ApiError(403, 'Not your ride');
    const baseUrl = process.env.SHARE_RIDE_BASE_URL || 'https://sawaari.example/track';
    return {
        url: `${baseUrl}/${rideId}?token=${ride.user_id}`,
        ride: {
            id: ride.id,
            pickup: ride.pickup_address,
            dropoff: ride.dropoff_address,
            driverName: ride.driver_name,
            vehiclePlate: ride.vehicle_plate,
            status: ride.status,
        },
    };
};

export const listRideEvents = async (rideId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM ride_events WHERE ride_id = ? ORDER BY created_at ASC`,
        [rideId]
    );
    return rows;
};

export const payRide = async ({ rideId, userId, method, razorpayPayload = null }) => {
    const ride = await getRideById(rideId);
    if (!ride) throw new ApiError(404, 'Ride not found');
    if (Number(ride.user_id) !== Number(userId)) throw new ApiError(403, 'Not your ride');

    const amount = Number(ride.final_fare || ride.estimated_fare) - Number(ride.discount_amount || 0);
    if (amount <= 0) return { status: 'NO_AMOUNT_DUE' };

    if (method === 'CASH') {
        await recordCashPayment({ rideId, userId, amount });
        return { status: 'PAID', method: 'CASH', amount };
    }
    if (method === 'WALLET') {
        await recordWalletPayment({ rideId, userId, amount });
        return { status: 'PAID', method: 'WALLET', amount };
    }
    throw new ApiError(400, 'Use the Razorpay flow for ONLINE payments');
};

// ============================================================
// Scheduled-ride sweeper (call from a setInterval in server.js)
// ============================================================
export const promoteScheduledRides = async () => {
    const [rows] = await pool.execute(
        `UPDATE rides SET status = 'SEARCHING' WHERE status = 'SCHEDULED' AND scheduled_at <= NOW()`
    );
    if (rows.affectedRows > 0) {
        const [newlySearching] = await pool.execute(
            `SELECT id FROM rides WHERE status = 'SEARCHING' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`
        );
        for (const r of newlySearching) dispatchRideRequests(r.id).catch(() => {});
    }
    return rows.affectedRows;
};
