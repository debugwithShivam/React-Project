import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';

// Memoized so the CREATE TABLE runs at most once per process.
let tableReady = null;
const ensureTable = () => {
    if (!tableReady) {
        tableReady = pool
            .execute(
                `CREATE TABLE IF NOT EXISTS saved_places (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    label VARCHAR(20) NOT NULL DEFAULT 'OTHER',
                    name VARCHAR(80) NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    lat DECIMAL(10,7) NULL,
                    lng DECIMAL(10,7) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_saved_places_user (user_id)
                )`
            )
            .catch((e) => {
                tableReady = null;
                throw e;
            });
    }
    return tableReady;
};

const ALLOWED_LABELS = ['HOME', 'WORK', 'OTHER'];

export const listPlaces = async (userId) => {
    await ensureTable();
    const [rows] = await pool.execute(
        `SELECT id, label, name, address, lat, lng, created_at
         FROM saved_places WHERE user_id = ? ORDER BY created_at ASC`,
        [userId]
    );
    return rows;
};

export const addPlace = async ({ userId, label = 'OTHER', name, address, lat = null, lng = null }) => {
    await ensureTable();
    const cleanName = String(name || '').trim();
    const cleanAddress = String(address || '').trim();
    if (!cleanName || !cleanAddress) throw new ApiError(400, 'name and address are required');

    const cleanLabel = ALLOWED_LABELS.includes(String(label).toUpperCase())
        ? String(label).toUpperCase()
        : 'OTHER';

    // Keep a single HOME / WORK entry per user (upsert by label).
    if (cleanLabel !== 'OTHER') {
        await pool.execute(`DELETE FROM saved_places WHERE user_id = ? AND label = ?`, [userId, cleanLabel]);
    }

    const [r] = await pool.execute(
        `INSERT INTO saved_places (user_id, label, name, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, cleanLabel, cleanName, cleanAddress, lat, lng]
    );
    const [rows] = await pool.execute(`SELECT * FROM saved_places WHERE id = ?`, [r.insertId]);
    return rows[0];
};

export const deletePlace = async (placeId, userId) => {
    await ensureTable();
    const [r] = await pool.execute(`DELETE FROM saved_places WHERE id = ? AND user_id = ?`, [placeId, userId]);
    if (!r.affectedRows) throw new ApiError(404, 'Place not found');
    return { success: true };
};
