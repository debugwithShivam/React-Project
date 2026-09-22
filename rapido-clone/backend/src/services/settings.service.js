import pool from '../config/DBconfig/database.js';

// In-memory cache (refresh on write).
let cache = null;
let cacheAt = 0;
const TTL_MS = 30_000;

const coerce = (row) => {
    const v = row.setting_value;
    switch (row.value_type) {
        case 'NUMBER':
            return Number(v);
        case 'BOOLEAN':
            return v === 'true' || v === '1';
        case 'JSON':
            try {
                return JSON.parse(v);
            } catch {
                return v;
            }
        default:
            return v;
    }
};

export const getAllSettings = async ({ forceRefresh = false } = {}) => {
    if (!forceRefresh && cache && Date.now() - cacheAt < TTL_MS) return cache;
    const [rows] = await pool.execute(`SELECT * FROM settings`);
    cache = Object.fromEntries(rows.map((r) => [r.setting_key, coerce(r)]));
    cacheAt = Date.now();
    return cache;
};

export const getSetting = async (key, fallback = null) => {
    const all = await getAllSettings();
    return key in all ? all[key] : fallback;
};

export const setSetting = async (key, value, { valueType, group, description } = {}) => {
    const serialized =
        typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
    const inferredType =
        valueType ||
        (typeof value === 'number'
            ? 'NUMBER'
            : typeof value === 'boolean'
              ? 'BOOLEAN'
              : typeof value === 'object'
                ? 'JSON'
                : 'STRING');

    await pool.execute(
        `INSERT INTO settings (setting_key, setting_value, value_type, setting_group, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             setting_value = VALUES(setting_value),
             value_type    = VALUES(value_type),
             setting_group = COALESCE(VALUES(setting_group), setting_group),
             description   = COALESCE(VALUES(description), description)`,
        [key, serialized, inferredType, group || 'GENERAL', description || null]
    );
    cache = null;
    return getSetting(key);
};

export const listSettingsRows = async () => {
    const [rows] = await pool.execute(`SELECT * FROM settings ORDER BY setting_group, setting_key`);
    return rows;
};

export const deleteSetting = async (key) => {
    await pool.execute(`DELETE FROM settings WHERE setting_key = ?`, [key]);
    cache = null;
};
