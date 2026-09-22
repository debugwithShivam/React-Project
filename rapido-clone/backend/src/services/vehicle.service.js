import pool from '../config/DBconfig/database.js';

export const listVehicleTypes = async ({ includeInactive = false } = {}) => {
    const [rows] = await pool.execute(
        `SELECT * FROM vehicle_types ${includeInactive ? '' : 'WHERE is_active = TRUE'} ORDER BY sort_order, id`
    );
    return rows;
};

export const getVehicleType = async (codeOrId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM vehicle_types WHERE code = ? OR id = ? LIMIT 1`,
        [String(codeOrId).toUpperCase(), Number(codeOrId) || 0]
    );
    return rows[0] || null;
};

export const createVehicleType = async (data) => {
    const {
        code,
        name,
        description = null,
        icon_url = null,
        capacity = 1,
        base_fare = 30,
        per_km_fare = 8,
        per_min_fare = 1.5,
        minimum_fare = 30,
        cancellation_fee = 10,
        commission_percent = 15,
        is_active = true,
        sort_order = 0,
    } = data;

    const [result] = await pool.execute(
        `INSERT INTO vehicle_types
         (code, name, description, icon_url, capacity, base_fare, per_km_fare, per_min_fare,
          minimum_fare, cancellation_fee, commission_percent, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            String(code).toUpperCase(),
            name,
            description,
            icon_url,
            capacity,
            base_fare,
            per_km_fare,
            per_min_fare,
            minimum_fare,
            cancellation_fee,
            commission_percent,
            !!is_active,
            sort_order,
        ]
    );
    return getVehicleType(result.insertId);
};

export const updateVehicleType = async (id, data) => {
    const allowed = [
        'name',
        'description',
        'icon_url',
        'capacity',
        'base_fare',
        'per_km_fare',
        'per_min_fare',
        'minimum_fare',
        'cancellation_fee',
        'commission_percent',
        'is_active',
        'sort_order',
    ];
    const fields = [];
    const params = [];
    for (const k of allowed) {
        if (k in data) {
            fields.push(`${k} = ?`);
            params.push(k === 'is_active' ? !!data[k] : data[k]);
        }
    }
    if (!fields.length) return getVehicleType(id);
    params.push(id);
    await pool.execute(`UPDATE vehicle_types SET ${fields.join(', ')} WHERE id = ?`, params);
    return getVehicleType(id);
};

export const deleteVehicleType = async (id) => {
    await pool.execute(`DELETE FROM vehicle_types WHERE id = ?`, [id]);
};
