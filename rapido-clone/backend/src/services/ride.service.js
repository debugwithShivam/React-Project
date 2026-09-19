import pool from '../config/DBconfig/database.js';

export const createRide = async ({
    userId,
    pickupAddress,
    pickupLat,
    pickupLng,
    dropoffAddress,
    dropoffLat,
    dropoffLng,
    vehicleType,
    estimatedFare,
}) => {
    const [result] = await pool.execute(
        `
        INSERT INTO rides (
            user_id,
            pickup_address,
            pickup_lat,
            pickup_lng,
            dropoff_address,
            dropoff_lat,
            dropoff_lng,
            vehicle_type,
            status,
            estimated_fare
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SEARCHING', ?)
        `,
        [
            userId,
            pickupAddress,
            pickupLat || null,
            pickupLng || null,
            dropoffAddress,
            dropoffLat || null,
            dropoffLng || null,
            vehicleType,
            estimatedFare,
        ]
    );

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM rides
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
    );

    return rows[0];
};