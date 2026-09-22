import pool from '../config/DBconfig/database.js';

export const listCities = async ({ includeInactive = false } = {}) => {
    const [rows] = await pool.execute(
        `SELECT * FROM cities ${includeInactive ? '' : 'WHERE is_active = TRUE'} ORDER BY name`
    );
    return rows;
};

export const createCity = async (data) => {
    const { name, state = null, country = 'India', center_lat = null, center_lng = null, radius_km = 25, is_active = true } = data;
    const [r] = await pool.execute(
        `INSERT INTO cities (name, state, country, center_lat, center_lng, radius_km, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, state, country, center_lat, center_lng, radius_km, !!is_active]
    );
    const [rows] = await pool.execute(`SELECT * FROM cities WHERE id = ?`, [r.insertId]);
    return rows[0];
};

export const updateCity = async (id, data) => {
    const allowed = ['name', 'state', 'country', 'center_lat', 'center_lng', 'radius_km', 'is_active'];
    const fields = [];
    const params = [];
    for (const k of allowed) {
        if (k in data) {
            fields.push(`${k} = ?`);
            params.push(k === 'is_active' ? !!data[k] : data[k]);
        }
    }
    if (!fields.length) return null;
    params.push(id);
    await pool.execute(`UPDATE cities SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.execute(`SELECT * FROM cities WHERE id = ?`, [id]);
    return rows[0];
};

export const deleteCity = async (id) => {
    await pool.execute(`DELETE FROM cities WHERE id = ?`, [id]);
};
