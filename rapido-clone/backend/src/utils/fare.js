import pool from '../config/DBconfig/database.js';
import { roadDistanceKm, estimateDurationMin } from './geo.js';

/**
 * Calculate fare for a given vehicle type and route coordinates.
 * Returns { distanceKm, durationMin, baseFare, distanceFare, timeFare, totalFare, breakdown }.
 * Falls back to defaults if vehicle type not in DB.
 */
export const calculateFare = async ({ vehicleType, pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
    const code = String(vehicleType || 'BIKE').toUpperCase();

    const [rows] = await pool.execute(
        `SELECT * FROM vehicle_types WHERE code = ? AND is_active = TRUE LIMIT 1`,
        [code]
    );

    const vt =
        rows[0] || {
            code,
            base_fare: 30,
            per_km_fare: 8,
            per_min_fare: 1.5,
            minimum_fare: 30,
            commission_percent: 15,
        };

    const straightKm =
        pickupLat != null && pickupLng != null && dropoffLat != null && dropoffLng != null
            ? Math.max(
                  0.5,
                  roadDistanceKm(
                      // haversine inline to avoid circular import
                      (() => {
                          const toRad = (d) => (d * Math.PI) / 180;
                          const R = 6371;
                          const dLat = toRad(Number(dropoffLat) - Number(pickupLat));
                          const dLng = toRad(Number(dropoffLng) - Number(pickupLng));
                          const a =
                              Math.sin(dLat / 2) ** 2 +
                              Math.cos(toRad(Number(pickupLat))) *
                                  Math.cos(toRad(Number(dropoffLat))) *
                                  Math.sin(dLng / 2) ** 2;
                          return 2 * R * Math.asin(Math.sqrt(a));
                      })()
                  )
              )
            : 5;

    const distanceKm = Number(straightKm.toFixed(2));
    const durationMin = estimateDurationMin(distanceKm, code === 'BIKE' ? 30 : 25);

    const baseFare = Number(vt.base_fare);
    const distanceFare = distanceKm * Number(vt.per_km_fare);
    const timeFare = durationMin * Number(vt.per_min_fare);
    const rawTotal = baseFare + distanceFare + timeFare;
    const totalFare = Math.max(Number(vt.minimum_fare), rawTotal);

    return {
        vehicleType: vt.code,
        vehicleName: vt.name,
        distanceKm,
        durationMin,
        baseFare: round2(baseFare),
        distanceFare: round2(distanceFare),
        timeFare: round2(timeFare),
        totalFare: round2(totalFare),
        commissionPercent: Number(vt.commission_percent),
        breakdown: {
            baseFare: round2(baseFare),
            perKm: Number(vt.per_km_fare),
            perMin: Number(vt.per_min_fare),
            minimumFare: Number(vt.minimum_fare),
        },
    };
};

const round2 = (n) => Math.round(Number(n) * 100) / 100;
