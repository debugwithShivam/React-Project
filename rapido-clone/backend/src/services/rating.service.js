import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';

export const submitRating = async ({ rideId, raterId, raterRole, rating, comment = null }) => {
    rating = Number(rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        throw new ApiError(400, 'Rating must be an integer between 1 and 5');

    const [rideRows] = await pool.execute(`SELECT * FROM rides WHERE id = ? LIMIT 1`, [rideId]);
    if (!rideRows.length) throw new ApiError(404, 'Ride not found');
    const ride = rideRows[0];
    if (ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED')
        throw new ApiError(400, 'You can only rate completed or cancelled rides');

    // Determine ratee.
    let rateeId;
    if (raterRole === 'USER') {
        if (ride.user_id !== Number(raterId)) throw new ApiError(403, 'Not your ride');
        if (!ride.driver_id) throw new ApiError(400, 'No driver was assigned to this ride');
        const [d] = await pool.execute(`SELECT user_id FROM drivers WHERE id = ?`, [ride.driver_id]);
        if (!d.length) throw new ApiError(404, 'Driver record missing');
        rateeId = d[0].user_id;
    } else if (raterRole === 'DRIVER') {
        const [d] = await pool.execute(`SELECT id FROM drivers WHERE user_id = ?`, [raterId]);
        if (!d.length || Number(ride.driver_id) !== Number(d[0].id))
            throw new ApiError(403, 'Not your ride');
        rateeId = ride.user_id;
    } else {
        throw new ApiError(400, 'Invalid rater role');
    }

    const [r] = await pool.execute(
        `INSERT INTO ratings (ride_id, rater_id, ratee_id, rater_role, rating, comment)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
        [rideId, raterId, rateeId, raterRole, rating, comment]
    );

    await recomputeRating(rateeId);

    return { id: r.insertId || 'updated', rideId, raterId, rateeId, rating, comment };
};

const recomputeRating = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT AVG(rating) AS avg_rating, COUNT(*) AS n FROM ratings WHERE ratee_id = ?`,
        [userId]
    );
    const avg = Number(rows[0].avg_rating || 0).toFixed(2);
    const n = rows[0].n;

    const [u] = await pool.execute(`SELECT role FROM users WHERE id = ?`, [userId]);
    if (!u.length) return;
    await pool.execute(`UPDATE users SET rating_avg = ?, rating_count = ? WHERE id = ?`, [avg, n, userId]);
    if (u[0].role === 'DRIVER') {
        await pool.execute(`UPDATE drivers SET rating_avg = ?, rating_count = ? WHERE user_id = ?`, [
            avg,
            n,
            userId,
        ]);
    }
};

export const listRatingsForUser = async (userId, { limit = 50 } = {}) => {
    const [rows] = await pool.execute(
        `SELECT r.*, u.name AS rater_name, ride.pickup_address, ride.dropoff_address
         FROM ratings r
         JOIN users u ON u.id = r.rater_id
         JOIN rides ride ON ride.id = r.ride_id
         WHERE r.ratee_id = ?
         ORDER BY r.created_at DESC LIMIT ?`,
        [userId, Number(limit)]
    );
    return rows;
};

export const listAllRatings = async ({ limit = 200, offset = 0, rating } = {}) => {
    const where = rating ? `WHERE r.rating = ?` : '';
    const params = rating ? [Number(rating), Number(limit), Number(offset)] : [Number(limit), Number(offset)];
    const [rows] = await pool.execute(
        `SELECT r.*,
                rater.name AS rater_name, ratee.name AS ratee_name,
                ride.pickup_address, ride.dropoff_address, ride.vehicle_type
         FROM ratings r
         JOIN users rater ON rater.id = r.rater_id
         JOIN users ratee ON ratee.id = r.ratee_id
         JOIN rides ride ON ride.id = r.ride_id
         ${where}
         ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
        params
    );
    return rows;
};

export const deleteRating = async (id) => {
    const [rows] = await pool.execute(`SELECT ratee_id FROM ratings WHERE id = ?`, [id]);
    await pool.execute(`DELETE FROM ratings WHERE id = ?`, [id]);
    if (rows.length) await recomputeRating(rows[0].ratee_id);
};
