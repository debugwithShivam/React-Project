import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser, emitToRide, emitToAdmins, getIo, isDriverOnline } from '../socket/index.js';
import { findNearbyDrivers } from './matching.service.js';
import { createNotification } from './notification.service.js';
import { adjustWallet } from './wallet.service.js';
import { calculateFare } from '../utils/fare.js';
import { generateRideOtp } from '../utils/otp.js';
import { getSetting } from './settings.service.js';

// ============================================================
// Driver state
// ============================================================

export const getDriverByUserId = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT d.*, u.name, u.phone, u.email, u.profile_image, u.rating_avg AS user_rating_avg,
                u.is_active AS user_active
         FROM drivers d JOIN users u ON u.id = d.user_id WHERE d.user_id = ? LIMIT 1`,
        [userId]
    );
    return rows[0] || null;
};

export const getDriverById = async (driverId) => {
    const [rows] = await pool.execute(
        `SELECT d.*, u.name, u.phone, u.email, u.profile_image
         FROM drivers d JOIN users u ON u.id = d.user_id WHERE d.id = ? LIMIT 1`,
        [driverId]
    );
    return rows[0] || null;
};

export const toggleOnline = async ({ driverUserId, isOnline, lat = null, lng = null }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver profile not found');
    if (driver.status !== 'APPROVED')
        throw new ApiError(403, `Driver account is ${driver.status.toLowerCase()} — cannot go online`);

    await pool.execute(
        `UPDATE drivers SET is_online = ?, current_lat = COALESCE(?, current_lat), current_lng = COALESCE(?, current_lng),
                last_location_update = NOW() WHERE id = ?`,
        [!!isOnline, lat, lng, driver.id]
    );

    emitToAdmins('driver:online-change', { driverId: driver.id, userId: driverUserId, isOnline: !!isOnline });
    return { isOnline: !!isOnline };
};

export const updateLocation = async ({ driverUserId, lat, lng, heading = 0, speed = 0 }) => {
    if (lat == null || lng == null) throw new ApiError(400, 'lat,lng required');
    await pool.execute(
        `UPDATE drivers SET current_lat = ?, current_lng = ?, last_location_update = NOW() WHERE user_id = ?`,
        [lat, lng, driverUserId]
    );
};

export const updateDriverProfile = async ({ driverUserId, patch }) => {
    const allowed = ['payout_upi', 'vehicle_model', 'vehicle_plate', 'city'];
    const fields = [];
    const params = [];
    for (const k of allowed) {
        if (k in patch) {
            fields.push(`${k} = ?`);
            params.push(patch[k]);
        }
    }
    if (!fields.length) return getDriverByUserId(driverUserId);
    params.push(driverUserId);
    await pool.execute(`UPDATE drivers SET ${fields.join(', ')} WHERE user_id = ?`, params);
    return getDriverByUserId(driverUserId);
};

export const uploadAdditionalDocument = async ({ driverUserId, documentType, documentSide, file }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver profile not found');
    if (!file) throw new ApiError(400, 'File required');
    const [r] = await pool.execute(
        `INSERT INTO driver_documents (driver_id, document_type, document_side, file_name, file_data, verification_status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [driver.id, documentType, documentSide || null, file.originalname, file.buffer]
    );
    return { id: r.insertId, documentType, documentSide };
};

export const listDriverDocuments = async (driverUserId) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) return [];
    const [rows] = await pool.execute(
        `SELECT id, document_type, document_side, file_name, verification_status, created_at
         FROM driver_documents WHERE driver_id = ? ORDER BY document_type, document_side`,
        [driver.id]
    );
    return rows;
};

export const getDocumentBlob = async (documentId, driverUserId = null) => {
    let sql = `SELECT file_data, file_name FROM driver_documents WHERE id = ?`;
    const params = [documentId];
    if (driverUserId) {
        sql = `SELECT dd.file_data, dd.file_name FROM driver_documents dd
               JOIN drivers d ON d.id = dd.driver_id WHERE dd.id = ? AND d.user_id = ?`;
        params.push(driverUserId);
    }
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
};

// ============================================================
// Driver: ride flow
// ============================================================

export const listNearbyRideRequests = async ({ driverUserId, radiusKm = 5 }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver || driver.current_lat == null) return [];
    const [rows] = await pool.execute(
        `SELECT r.*, u.name AS user_name, u.phone AS user_phone, u.rating_avg AS user_rating
         FROM rides r JOIN users u ON u.id = r.user_id
         WHERE r.status = 'SEARCHING' AND r.driver_id IS NULL
           AND (UPPER(r.vehicle_type) = UPPER(?) OR ? IS NULL)
           AND r.pickup_lat IS NOT NULL
         ORDER BY r.created_at DESC LIMIT 30`,
        [driver.vehicle_type, driver.vehicle_type]
    );
    return rows
        .map((r) => ({
            ...r,
            distanceKm: Number(
                (
                    Math.acos(
                        Math.sin((Number(driver.current_lat) * Math.PI) / 180) *
                        Math.sin((Number(r.pickup_lat) * Math.PI) / 180) +
                        Math.cos((Number(driver.current_lat) * Math.PI) / 180) *
                        Math.cos((Number(r.pickup_lat) * Math.PI) / 180) *
                        Math.cos(
                            (Number(r.pickup_lng) * Math.PI) / 180 -
                            (Number(driver.current_lng) * Math.PI) / 180
                        )
                    ) * 6371
                ).toFixed(2)
            ),
        }))
        .filter((r) => r.distanceKm <= radiusKm);
};

export const acceptRide = async ({ driverUserId, rideId }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver profile not found');
    if (driver.status !== 'APPROVED') throw new ApiError(403, 'Driver not approved');

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.execute(
            `SELECT * FROM rides
     WHERE id = ?
       AND status = 'SEARCHING'
       AND driver_id IS NULL
     FOR UPDATE`,
            [rideId]
        );

        if (!rows.length) {
            await conn.rollback();
            throw new ApiError(409, 'Ride no longer available');
        }

        const ride = rows[0];

        // Lock and re-check the driver's current state inside the transaction.
        // The driver may have accepted another ride after the request was sent.
        const [driverRows] = await conn.execute(
            `SELECT d.*
     FROM drivers d
     WHERE d.id = ?
       AND d.status = 'APPROVED'
       AND d.is_online = TRUE
       AND d.id NOT IN (
           SELECT driver_id
           FROM rides
           WHERE status IN ('ACCEPTED', 'ARRIVING', 'STARTED')
             AND driver_id IS NOT NULL
       )
     FOR UPDATE`,
            [driver.id]
        );

        if (!driverRows.length) {
            await conn.rollback();
            throw new ApiError(409, 'Driver is no longer available');
        }

        const otp = generateRideOtp();

        await conn.execute(
            `UPDATE rides SET driver_id = ?, status = 'ACCEPTED', accepted_at = NOW(), start_otp = ? WHERE id = ?`,
            [driver.id, otp, rideId]
        );
        await conn.execute(
            `INSERT INTO ride_events (ride_id, driver_id, event_type) VALUES (?, ?, 'ACCEPTED')`,
            [rideId, driver.id]
        );
        await conn.commit();

        const payload = {
            rideId,
            status: 'ACCEPTED',
            driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone,
                profileImage: driver.profile_image,
                vehicleType: driver.vehicle_type,
                vehicleModel: driver.vehicle_model,
                vehiclePlate: driver.vehicle_plate,
                rating: Number(driver.rating_avg),
            },
            startOtp: otp,
            pickup: { lat: ride.pickup_lat, lng: ride.pickup_lng, address: ride.pickup_address },
        };
        emitToUser(ride.user_id, 'ride:accepted', payload);
        // The ride room includes the driver — never broadcast the start OTP there.
        const { startOtp, ...roomPayload } = payload;
        emitToRide(rideId, 'ride:status', roomPayload);
        emitToAdmins('admin:ride-updated', { rideId, status: 'ACCEPTED', driverId: driver.id });

        // Notify all other drivers who got this request that it's no longer available
        cancelPendingRequests(rideId, driver.user_id);

        await createNotification({
            userId: ride.user_id,
            title: 'Driver assigned',
            body: `${driver.name} is on the way. Share OTP ${otp} to start the ride.`,
            type: 'RIDE',
            data: { rideId, driverId: driver.id, otp },
        });

        // OTP is returned only for the customer's own notification path above;
        // the driver-facing response must not include it.
        return { rideId, driver };
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
};

export const rejectRide = async ({ driverUserId, rideId, reason = null }) => {
    const driver = await getDriverByUserId(driverUserId);

    await pool.execute(
        `INSERT INTO ride_events (ride_id, driver_id, event_type, payload_json) VALUES (?, ?, 'REJECTED', ?)`,
        [rideId, driver?.id ?? null, JSON.stringify({ driverUserId, reason })]
    );

    // Free this driver from the dispatch set so a re-dispatch can reach
    // additional nearby captains instead of waiting for the timeout.
    const dispatched = rideDispatchedTo.get(rideId);
    if (dispatched) dispatched.delete(driverUserId);

    const [rows] = await pool.execute(
        `SELECT id, status FROM rides WHERE id = ? LIMIT 1`,
        [rideId]
    );
    if (rows.length && rows[0].status === 'SEARCHING') {
        dispatchRideRequests(rideId).catch((e) => console.error('[reject-redispatch]', e.message));
    }

    return { rideId, rejected: true };
};

export const markArrived = async ({ driverUserId, rideId, lat = null, lng = null }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver not found');
    // Atomic guarded transition — no separate read/write race.
    const [upd] = await pool.execute(
        `UPDATE rides SET status = 'ARRIVING', arrived_at = NOW()
         WHERE id = ? AND driver_id = ? AND status = 'ACCEPTED'`,
        [rideId, driver.id]
    );
    if (upd.affectedRows === 0) throw new ApiError(409, 'Ride not in ACCEPTED state');
    const [rows] = await pool.execute(`SELECT * FROM rides WHERE id = ? LIMIT 1`, [rideId]);
    const ride = rows[0];

    await pool.execute(
        `INSERT INTO ride_events (ride_id, driver_id, event_type, lat, lng) VALUES (?, ?, 'ARRIVED', ?, ?)`,
        [rideId, driver.id, lat, lng]
    );

    const payload = { rideId, status: 'ARRIVING' };
    emitToUser(ride.user_id, 'ride:status', payload);
    emitToRide(rideId, 'ride:status', payload);
    await createNotification({
        userId: ride.user_id,
        title: 'Driver has arrived',
        body: `Your driver is at the pickup point. Share OTP ${ride.start_otp} to start.`,
        type: 'RIDE',
        data: { rideId },
    });
    return payload;
};

// In-process throttle for OTP guessing. Bounded per ride; cleared on success.
const otpAttemptCounts = new Map();
const MAX_OTP_ATTEMPTS = 5;

export const startRide = async ({ driverUserId, rideId, otp }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver not found');
    const [rows] = await pool.execute(
        `SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status IN ('ACCEPTED','ARRIVING') LIMIT 1`,
        [rideId, driver.id]
    );
    if (!rows.length) throw new ApiError(409, 'Ride not in startable state');
    const ride = rows[0];

    // OTP expiry — valid only for a window after acceptance.
    const otpValidMin = Number(await getSetting('ride_otp_valid_minutes', 15));
    const acceptedAt = ride.accepted_at ? new Date(ride.accepted_at) : null;
    if (acceptedAt && (Date.now() - acceptedAt.getTime()) / 60000 > otpValidMin)
        throw new ApiError(410, 'OTP expired — ask the rider for a new one');

    // Brute-force throttle.
    const attempts = otpAttemptCounts.get(rideId) || 0;
    if (attempts >= MAX_OTP_ATTEMPTS)
        throw new ApiError(429, 'Too many incorrect OTP attempts');

    if (!otp || String(otp) !== String(ride.start_otp)) {
        otpAttemptCounts.set(rideId, attempts + 1);
        throw new ApiError(400, 'Invalid OTP');
    }
    otpAttemptCounts.delete(rideId);

    // Atomic transition + single-use: clear the OTP as part of the guard.
    const [upd] = await pool.execute(
        `UPDATE rides SET status = 'STARTED', started_at = NOW(), start_otp = NULL
         WHERE id = ? AND driver_id = ? AND status IN ('ACCEPTED','ARRIVING') AND start_otp = ?`,
        [rideId, driver.id, String(otp)]
    );
    if (upd.affectedRows === 0) throw new ApiError(409, 'Ride could not be started');
    await pool.execute(
        `INSERT INTO ride_events (ride_id, driver_id, event_type) VALUES (?, ?, 'STARTED')`,
        [rideId, driver.id]
    );

    const payload = { rideId, status: 'STARTED', startedAt: new Date().toISOString() };
    emitToUser(ride.user_id, 'ride:status', payload);
    emitToRide(rideId, 'ride:status', payload);
    return payload;
};

export const completeRide = async ({ driverUserId, rideId }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver not found');

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.execute(
            `SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status = 'STARTED' FOR UPDATE`,
            [rideId, driver.id]
        );
        if (!rows.length) {
            await conn.rollback();
            throw new ApiError(409, 'Ride not in STARTED state');
        }
        const ride = rows[0];

        // Backend is the fare authority — always recompute from stored
        // coordinates. Client-supplied finalFare/distance/duration are ignored.
        const est = await calculateFare({
            vehicleType: ride.vehicle_type,
            pickupLat: ride.pickup_lat,
            pickupLng: ride.pickup_lng,
            dropoffLat: ride.dropoff_lat,
            dropoffLng: ride.dropoff_lng,
        });
        const computedFinal = est.totalFare;
        const computedDistance = est.distanceKm;
        const computedDuration = est.durationMin;

        // Commission based on vehicle type (or default setting).
        const [vtRows] = await conn.execute(
            `SELECT commission_percent FROM vehicle_types WHERE code = UPPER(?) LIMIT 1`,
            [ride.vehicle_type]
        );
        const commissionPercent = vtRows.length
            ? Number(vtRows[0].commission_percent)
            : Number(await getSetting('default_commission_percent', 15));
        const commission = Math.round(Number(computedFinal) * commissionPercent) / 100;
        const driverEarnings = Number(computedFinal) - commission;

        await conn.execute(
            `UPDATE rides SET status = 'COMPLETED', completed_at = NOW(), final_fare = ?, distance_km = ?, duration_min = ?,
                    commission_amount = ?, driver_earnings = ?
             WHERE id = ?`,
            [computedFinal, computedDistance, computedDuration, commission, driverEarnings, rideId]
        );
        await conn.execute(
            `INSERT INTO ride_events (ride_id, driver_id, event_type) VALUES (?, ?, 'COMPLETED')`,
            [rideId, driver.id]
        );
        await conn.execute(
            `UPDATE drivers SET total_rides = total_rides + 1, total_earnings = total_earnings + ? WHERE id = ?`,
            [driverEarnings, driver.id]
        );
        await conn.commit();

        // Credit driver wallet (outside the txn so failures don't roll back the ride).
        try {
            await adjustWallet({
                userId: driver.user_id,
                amount: driverEarnings,
                type: 'CREDIT',
                reason: 'RIDE_EARNING',
                referenceType: 'RIDE',
                referenceId: rideId,
            });
        } catch (e) {
            console.error('[completeRide] wallet credit failed', e.message);
        }

        const payload = {
            rideId,
            status: 'COMPLETED',
            finalFare: Number(computedFinal),
            distanceKm: Number(computedDistance),
            durationMin: Number(computedDuration),
            commission,
            driverEarnings,
        };
        emitToUser(ride.user_id, 'ride:status', payload);
        emitToRide(rideId, 'ride:status', payload);
        emitToAdmins('admin:ride-updated', payload);
        await createNotification({
            userId: ride.user_id,
            title: 'Ride completed',
            body: `Your ride ended. Fare ₹${computedFinal}. Please pay and rate your driver.`,
            type: 'RIDE',
            data: { rideId, finalFare: computedFinal },
        });
        await createNotification({
            userId: driver.user_id,
            title: 'Ride completed',
            body: `You earned ₹${driverEarnings.toFixed(2)} (after ₹${commission.toFixed(2)} commission).`,
            type: 'EARNING',
            data: { rideId, driverEarnings },
        });

        return payload;
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
};

export const cancelRideByDriver = async ({ driverUserId, rideId, reason = null }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver not found');
    const [rows] = await pool.execute(
        `SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status IN ('ACCEPTED','ARRIVING','STARTED')`,
        [rideId, driver.id]
    );
    if (!rows.length) throw new ApiError(409, 'Ride not cancellable');
    const ride = rows[0];

    const [upd] = await pool.execute(
        `UPDATE rides SET status = 'SEARCHING', cancelled_at = NULL, cancelled_by = NULL,
                cancellation_reason = NULL, driver_id = NULL
         WHERE id = ? AND driver_id = ? AND status IN ('ACCEPTED','ARRIVING','STARTED')`,
        [rideId, driver.id]
    );
    if (upd.affectedRows === 0) throw new ApiError(409, 'Ride not cancellable');
    await pool.execute(
        `INSERT INTO ride_events (ride_id, driver_id, event_type, payload_json) VALUES (?, ?, 'CANCELLED_BY_DRIVER', ?)`,
        [rideId, driver.id, JSON.stringify({ reason })]
    );

    const payload = { rideId, status: 'SEARCHING', by: 'DRIVER', reason };
    emitToUser(ride.user_id, 'ride:status', payload);
    emitToUser(ride.user_id, 'ride:cancelled', { rideId, status: 'CANCELLED', by: 'DRIVER', reason });
    emitToRide(rideId, 'ride:status', payload);
    await createNotification({
        userId: ride.user_id,
        title: 'Driver cancelled',
        body: reason || 'Driver ne cancel kiya. Hum aapke liye naya driver dhundh rahe hain.',
        type: 'RIDE',
        data: { rideId },
    });

    // Re-dispatch to find a new driver
    dispatchRideRequests(rideId).catch((e) => console.error('[retry-dispatch]', e.message));

    return payload;
};

// ============================================================
// Driver: trips / earnings
// ============================================================

export const listDriverTrips = async ({ driverUserId, status = null, limit = 50, offset = 0 }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) return [];
    const where = status ? `AND r.status = ?` : '';
    const params = status
        ? [driver.id, status, Number(limit), Number(offset)]
        : [driver.id, Number(limit), Number(offset)];
    const [rows] = await pool.execute(
        `SELECT r.*, u.name AS user_name, u.phone AS user_phone, u.rating_avg AS user_rating
         FROM rides r JOIN users u ON u.id = r.user_id
         WHERE r.driver_id = ? ${where}
         ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
        params
    );
    return rows;
};

export const getDriverEarnings = async ({ driverUserId, from = null, to = null }) => {
    const driver = await getDriverByUserId(driverUserId);
    if (!driver) throw new ApiError(404, 'Driver not found');

    const params = [driver.id];
    let dateClause = '';
    if (from && to) {
        dateClause = `AND r.completed_at BETWEEN ? AND ?`;
        params.push(from, to);
    }

    const [[summary]] = await pool.execute(
        `SELECT
            COUNT(*) AS rides_count,
            COALESCE(SUM(r.final_fare), 0) AS gross,
            COALESCE(SUM(r.commission_amount), 0) AS commission,
            COALESCE(SUM(r.driver_earnings), 0) AS net
         FROM rides r
         WHERE r.driver_id = ? AND r.status = 'COMPLETED' ${dateClause}`,
        params
    );

    const [daily] = await pool.execute(
        `SELECT DATE(r.completed_at) AS day,
                COUNT(*) AS rides,
                COALESCE(SUM(r.driver_earnings), 0) AS earnings
         FROM rides r
         WHERE r.driver_id = ? AND r.status = 'COMPLETED'
           AND r.completed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY DATE(r.completed_at) ORDER BY day DESC`,
        [driver.id]
    );

    return {
        driverId: driver.id,
        walletBalance: Number(driver.wallet_balance),
        totalRides: driver.total_rides,
        totalEarnings: Number(driver.total_earnings),
        rating: Number(driver.rating_avg),
        ratingCount: driver.rating_count,
        summary,
        daily,
    };
};

// ============================================================
// Matching / dispatch
// ============================================================

// Track which drivers received a request for each ride (rideId -> Set<driverUserId>)
// Used to: (1) avoid duplicate requests, (2) notify rejected drivers on accept
const rideDispatchedTo = new Map();

/**
 * Called after a ride is created — find nearby drivers and broadcast.
 * Returns number of drivers notified.
 */
export const dispatchRideRequests = async (rideId) => {
    const [rows] = await pool.execute(`SELECT * FROM rides WHERE id = ?`, [rideId]);
    if (!rows.length) return 0;
    const ride = rows[0];
    if (ride.status !== 'SEARCHING') return 0;

    const radiusKm = Number(await getSetting('driver_search_radius_km', 5));
    const nearby = await findNearbyDrivers({
        lat: ride.pickup_lat,
        lng: ride.pickup_lng,
        radiusKm,
        vehicleType: ride.vehicle_type,
        limit: 10,
    });

    const io = getIo();
    if (!io) return 0;

    // A database `is_online` flag shows intent; the socket check ensures the
    // captain app is actually connected before it receives a live request.
    const availableCaptains = nearby.filter((d) => isDriverOnline(d.user_id));

    // Track dispatched drivers for this ride
    if (!rideDispatchedTo.has(rideId)) rideDispatchedTo.set(rideId, new Set());
    const dispatchedSet = rideDispatchedTo.get(rideId);

    const timeoutSec = Number(await getSetting('ride_request_timeout_sec', 30));
    let notifiedCount = 0;

    for (const d of availableCaptains) {
        // Skip if already sent request to this driver for this ride
        if (dispatchedSet.has(d.user_id)) continue;
        dispatchedSet.add(d.user_id);

        const etaMinutes = Math.max(1, Math.ceil((d.distanceKm / 25) * 60));
        io.to(`user:${d.user_id}`).emit('ride:request', {
            ride: {
                id: rideId,
                pickup_address: ride.pickup_address,
                dropoff_address: ride.dropoff_address,
                pickup_lat: ride.pickup_lat,
                pickup_lng: ride.pickup_lng,
                dropoff_lat: ride.dropoff_lat,
                dropoff_lng: ride.dropoff_lng,
                vehicle_type: ride.vehicle_type,
                estimated_fare: Number(ride.estimated_fare),
                distance_km: d.distanceKm,
                eta_minutes: etaMinutes,
            },
            expiresInSec: timeoutSec,
        });
        notifiedCount++;
    }

    if (notifiedCount === 0 && dispatchedSet.size === 0) {
        // No drivers at all — notify user immediately
        emitToUser(ride.user_id, 'ride:no-drivers', {
            rideId,
            message: 'Aapke aas-paas koi driver available nahi hai. Please thodi der mein try karein.',
        });
        // Mark ride as CANCELLED
        await pool.execute(
            `UPDATE rides SET status = 'CANCELLED' WHERE id = ? AND status = 'SEARCHING'`,
            [rideId]
        );
        rideDispatchedTo.delete(rideId);
    } else if (notifiedCount > 0) {
        // Schedule timeout — if no one accepts in timeoutSec, cancel the ride
        setTimeout(() => checkRideTimeout(rideId), timeoutSec * 1000);
    }

    return notifiedCount;
};

/**
 * Called after timeout — if ride is still SEARCHING, cancel it and notify the user.
 */
export const checkRideTimeout = async (rideId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, user_id, status FROM rides WHERE id = ? LIMIT 1`,
            [rideId]
        );
        if (!rows.length) return;
        const ride = rows[0];
        if (ride.status !== 'SEARCHING') return; // Already accepted or cancelled

        await pool.execute(
            `UPDATE rides SET status = 'CANCELLED' WHERE id = ? AND status = 'SEARCHING'`,
            [rideId]
        );
        rideDispatchedTo.delete(rideId);

        emitToUser(ride.user_id, 'ride:no-drivers', {
            rideId,
            message: 'Koi bhi driver request accept nahi kar saka. Please dobara try karein.',
        });
        console.log(`[dispatch] Ride ${rideId} timed out → CANCELLED`);
    } catch (e) {
        console.error('[checkRideTimeout]', e.message);
    }
};

/**
 * Notify all drivers who received a request for rideId that it is no longer available.
 * Called when one driver accepts the ride.
 */
export const cancelPendingRequests = (rideId, winnerDriverUserId) => {
    const io = getIo();
    if (!io) return;
    const dispatched = rideDispatchedTo.get(rideId);
    if (!dispatched) return;
    for (const driverUserId of dispatched) {
        if (driverUserId === winnerDriverUserId) continue;
        io.to(`user:${driverUserId}`).emit('ride:request-cancelled', {
            rideId,
            reason: 'Another driver accepted this ride.',
        });
    }
    rideDispatchedTo.delete(rideId);
};
