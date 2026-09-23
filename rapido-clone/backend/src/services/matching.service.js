import pool from '../config/DBconfig/database.js';
import { haversineKm, boundingBox } from '../utils/geo.js';

/**
 * Find approved+online drivers near a point.
 * Returns array of { driverId, userId, name, phone, vehicleType, vehiclePlate, distanceKm, lat, lng, rating }
 */
export const findNearbyDrivers = async ({ lat, lng, radiusKm = 5, vehicleType = null, limit = 10 }) => {
    const box = boundingBox(Number(lat), Number(lng), Number(radiusKm));

    const params = [box.minLat, box.maxLat, box.minLng, box.maxLng];
    let vehicleClause = '';
    if (vehicleType) {
        vehicleClause = `AND (UPPER(d.vehicle_type) = ? OR UPPER(vt.code) = ?)`;
        params.push(String(vehicleType).toUpperCase(), String(vehicleType).toUpperCase());
    }

    const [rows] = await pool.execute(
        `SELECT d.id AS driver_id, d.user_id, d.vehicle_type, d.vehicle_plate, d.vehicle_model,
                d.current_lat, d.current_lng, d.rating_avg,
                u.name, u.phone, u.profile_image,
                vt.code AS vt_code
         FROM drivers d
         JOIN users u ON u.id = d.user_id
         LEFT JOIN vehicle_types vt ON vt.code = UPPER(d.vehicle_type)
         WHERE d.status = 'APPROVED'
           AND u.is_active = TRUE
           AND d.is_online = TRUE
           AND d.current_lat IS NOT NULL
           AND d.last_location_update >= NOW() - INTERVAL 2 MINUTE
           AND d.id NOT IN (
               SELECT driver_id FROM rides
               WHERE status IN ('ACCEPTED', 'ARRIVING', 'STARTED')
               AND driver_id IS NOT NULL
           )
           AND d.current_lat BETWEEN ? AND ?
           AND d.current_lng BETWEEN ? AND ?
           ${vehicleClause}
         LIMIT 100`,
        params
    );

    const enriched = rows
        .map((r) => ({
            ...r,
            distanceKm: Number(
                haversineKm(Number(lat), Number(lng), Number(r.current_lat), Number(r.current_lng)).toFixed(2)
            ),
        }))
        .filter((r) => r.distanceKm <= Number(radiusKm))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, Number(limit));

    return enriched;
};

/**
 * Count nearby drivers (for the user app's "X bikes nearby" UI).
 */
export const countNearbyDrivers = async ({ lat, lng, radiusKm = 5, vehicleType = null }) => {
    const drivers = await findNearbyDrivers({ lat, lng, radiusKm, vehicleType, limit: 100 });
    return drivers.length;
};
