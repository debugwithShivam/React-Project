import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';

const isCouponValid = (c, now = new Date()) => {
    if (!c.is_active) return { ok: false, reason: 'Coupon is not active' };
    if (new Date(c.valid_from) > now) return { ok: false, reason: 'Coupon is not yet valid' };
    if (new Date(c.valid_until) < now) return { ok: false, reason: 'Coupon has expired' };
    if (c.usage_limit > 0 && c.used_count >= c.usage_limit)
        return { ok: false, reason: 'Coupon usage limit reached' };
    return { ok: true };
};

export const validateCoupon = async ({ code, userId, fare, vehicleType, role = 'USER' }) => {
    if (!code) throw new ApiError(400, 'Coupon code required');
    const [rows] = await pool.execute(`SELECT * FROM coupons WHERE code = ? LIMIT 1`, [
        String(code).toUpperCase(),
    ]);
    if (!rows.length) throw new ApiError(404, 'Invalid coupon code');
    const c = rows[0];

    const v = isCouponValid(c);
    if (!v.ok) throw new ApiError(400, v.reason);

    if (!c.applicable_roles.split(',').map((s) => s.trim()).includes(role))
        throw new ApiError(400, 'Coupon not applicable to your account type');

    if (c.applicable_vehicle_types) {
        const allowed = c.applicable_vehicle_types.split(',').map((s) => s.trim().toUpperCase());
        if (vehicleType && !allowed.includes(String(vehicleType).toUpperCase()))
            throw new ApiError(400, `Coupon not valid for ${vehicleType}`);
    }

    if (Number(fare) < Number(c.min_fare))
        throw new ApiError(400, `Minimum fare ₹${c.min_fare} required for this coupon`);

    const [usedRows] = await pool.execute(
        `SELECT COUNT(*) AS n FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?`,
        [c.id, userId]
    );
    if (usedRows[0].n >= c.per_user_limit)
        throw new ApiError(400, 'You have already used this coupon the maximum number of times');

    let discount = 0;
    if (c.discount_type === 'FLAT') discount = Number(c.discount_value);
    else discount = (Number(fare) * Number(c.discount_value)) / 100;
    if (c.max_discount) discount = Math.min(discount, Number(c.max_discount));
    discount = Math.min(discount, Number(fare));
    discount = Math.round(discount * 100) / 100;

    return {
        coupon: { id: c.id, code: c.code, description: c.description, type: c.discount_type },
        discount,
        finalFare: Math.max(0, Number(fare) - discount),
    };
};

export const redeemCoupon = async ({ couponId, userId, rideId, discount }) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute(
            `INSERT INTO coupon_redemptions (coupon_id, user_id, ride_id, discount_amount) VALUES (?, ?, ?, ?)`,
            [couponId, userId, rideId, discount]
        );
        await conn.execute(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`, [couponId]);
        await conn.commit();
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
};

export const listCoupons = async ({ includeInactive = false } = {}) => {
    const [rows] = await pool.execute(
        `SELECT * FROM coupons ${includeInactive ? '' : 'WHERE is_active = TRUE'} ORDER BY valid_until DESC`
    );
    return rows;
};

export const listCouponsForUser = async ({ userId, fare, vehicleType, role = 'USER' }) => {
    const all = await listCoupons();
    const out = [];
    for (const c of all) {
        const v = isCouponValid(c);
        if (!v.ok) continue;
        if (!c.applicable_roles.split(',').map((s) => s.trim()).includes(role)) continue;
        if (c.applicable_vehicle_types) {
            const allowed = c.applicable_vehicle_types.split(',').map((s) => s.trim().toUpperCase());
            if (vehicleType && !allowed.includes(String(vehicleType).toUpperCase())) continue;
        }
        if (Number(fare || 0) < Number(c.min_fare)) continue;
        const [usedRows] = await pool.execute(
            `SELECT COUNT(*) AS n FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?`,
            [c.id, userId]
        );
        if (usedRows[0].n >= c.per_user_limit) continue;
        out.push(c);
    }
    return out;
};

export const createCoupon = async (data, adminId) => {
    const {
        code,
        description = null,
        discount_type = 'FLAT',
        discount_value,
        max_discount = null,
        min_fare = 0,
        valid_from,
        valid_until,
        usage_limit = 0,
        per_user_limit = 1,
        applicable_vehicle_types = null,
        applicable_roles = 'USER',
        is_active = true,
    } = data;

    if (!code || !discount_value || !valid_from || !valid_until)
        throw new ApiError(400, 'code, discount_value, valid_from, valid_until required');

    const [r] = await pool.execute(
        `INSERT INTO coupons
         (code, description, discount_type, discount_value, max_discount, min_fare,
          valid_from, valid_until, usage_limit, per_user_limit,
          applicable_vehicle_types, applicable_roles, is_active, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            String(code).toUpperCase(),
            description,
            discount_type,
            discount_value,
            max_discount,
            min_fare,
            valid_from,
            valid_until,
            usage_limit,
            per_user_limit,
            applicable_vehicle_types,
            applicable_roles,
            !!is_active,
            adminId,
        ]
    );
    const [rows] = await pool.execute(`SELECT * FROM coupons WHERE id = ?`, [r.insertId]);
    return rows[0];
};

export const updateCoupon = async (id, data) => {
    const allowed = [
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_fare',
        'valid_from',
        'valid_until',
        'usage_limit',
        'per_user_limit',
        'applicable_vehicle_types',
        'applicable_roles',
        'is_active',
    ];
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
    await pool.execute(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.execute(`SELECT * FROM coupons WHERE id = ?`, [id]);
    return rows[0];
};

export const deleteCoupon = async (id) => {
    await pool.execute(`DELETE FROM coupons WHERE id = ?`, [id]);
};
