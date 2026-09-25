import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../socket/index.js';

// Memoized so the CREATE TABLE runs at most once per process.
let tableReady = null;
const ensureTable = () => {
    if (!tableReady) {
        tableReady = pool
            .execute(
                `CREATE TABLE IF NOT EXISTS ride_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ride_id INT NOT NULL,
                    sender_id INT NOT NULL,
                    body TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    read_at TIMESTAMP NULL,
                    INDEX idx_ride_messages_ride (ride_id, id)
                )`
            )
            .catch((e) => {
                tableReady = null;
                throw e;
            });
    }
    return tableReady;
};

// Returns { ride, participantIds } after verifying `userId` is a party to the ride.
const authorizeRide = async (rideId, userId) => {
    const [rows] = await pool.execute(
        `SELECT r.id, r.user_id, r.status, d.user_id AS driver_user_id
         FROM rides r
         LEFT JOIN drivers d ON d.id = r.driver_id
         WHERE r.id = ? LIMIT 1`,
        [rideId]
    );
    if (!rows.length) throw new ApiError(404, 'Ride not found');
    const ride = rows[0];

    const participantIds = [Number(ride.user_id)];
    if (ride.driver_user_id) participantIds.push(Number(ride.driver_user_id));

    if (!participantIds.includes(Number(userId))) {
        throw new ApiError(403, 'Not your ride');
    }
    return { ride, participantIds };
};

export const listMessages = async (rideId, userId) => {
    await ensureTable();
    await authorizeRide(rideId, userId);
    const [rows] = await pool.execute(
        `SELECT m.id, m.ride_id, m.sender_id, m.body, m.created_at, m.read_at,
                u.name AS sender_name, u.role AS sender_role
         FROM ride_messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.ride_id = ?
         ORDER BY m.created_at ASC, m.id ASC
         LIMIT 500`,
        [rideId]
    );
    return rows;
};

export const sendMessage = async ({ rideId, senderId, body }) => {
    await ensureTable();
    const text = String(body || '').trim();
    if (!text) throw new ApiError(400, 'Message cannot be empty');
    if (text.length > 1000) throw new ApiError(400, 'Message too long');

    const { participantIds } = await authorizeRide(rideId, senderId);

    const [r] = await pool.execute(
        `INSERT INTO ride_messages (ride_id, sender_id, body) VALUES (?, ?, ?)`,
        [rideId, senderId, text]
    );

    const [rows] = await pool.execute(
        `SELECT m.id, m.ride_id, m.sender_id, m.body, m.created_at, m.read_at,
                u.name AS sender_name, u.role AS sender_role
         FROM ride_messages m JOIN users u ON u.id = m.sender_id
         WHERE m.id = ? LIMIT 1`,
        [r.insertId]
    );
    const message = rows[0];

    // Deliver to every participant's personal room (both sides always occupy it).
    for (const pid of participantIds) {
        emitToUser(pid, 'chat:message', message);
    }

    return message;
};

export const markRead = async (rideId, userId) => {
    await ensureTable();
    await authorizeRide(rideId, userId);
    await pool.execute(
        `UPDATE ride_messages SET read_at = NOW() WHERE ride_id = ? AND sender_id <> ? AND read_at IS NULL`,
        [rideId, userId]
    );
    return { success: true };
};
