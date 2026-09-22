import { asyncHandler } from '../utils/apiError.js';
import * as ride from '../services/ride.service.js';
import { findNearbyDrivers } from '../services/matching.service.js';

export const fareEstimateController = asyncHandler(async (req, res) => {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType } = req.query;
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng)
        return res.status(400).json({ success: false, message: 'Coordinates required' });

    if (vehicleType) {
        const est = await ride.estimateFare({ pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType });
        return res.json({ success: true, estimate: est });
    }
    const estimates = await ride.estimateAllVehicles({ pickupLat, pickupLng, dropoffLat, dropoffLng });
    res.json({ success: true, estimates });
});

export const nearbyVehiclesController = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 5, vehicleType } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat,lng required' });
    const drivers = await findNearbyDrivers({ lat, lng, radiusKm, vehicleType });
    const counts = drivers.reduce((acc, d) => {
        const k = (d.vehicle_type || d.vt_code || 'OTHER').toUpperCase();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {});
    res.json({ success: true, drivers, counts, total: drivers.length });
});

export const createRideController = asyncHandler(async (req, res) => {
    const {
        pickupAddress, pickupLat, pickupLng,
        dropoffAddress, dropoffLat, dropoffLng,
        vehicleType, estimatedFare, paymentMethod, couponCode, scheduledAt,
    } = req.body;

    if (!pickupAddress || !dropoffAddress || !vehicleType)
        return res.status(400).json({ success: false, message: 'pickupAddress, dropoffAddress, vehicleType required' });

    const created = await ride.createRide({
        userId: req.user.user,
        pickupAddress, pickupLat, pickupLng,
        dropoffAddress, dropoffLat, dropoffLng,
        vehicleType,
        estimatedFare,
        paymentMethod: paymentMethod || 'CASH',
        couponCode,
        scheduledAt,
    });

    res.status(201).json({ success: true, ride: created });
});

export const getMyRidesController = asyncHandler(async (req, res) => {
    const { status, limit } = req.query;
    const rides = await ride.getRidesForUser(req.user.user, { status, limit: Number(limit || 50) });
    res.json({ success: true, rides });
});

export const getActiveRideController = asyncHandler(async (req, res) => {
    const r = await ride.getActiveRideForUser(req.user.user);
    res.json({ success: true, ride: r });
});

export const getRideDetailController = asyncHandler(async (req, res) => {
    const r = await ride.getRideById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (Number(r.user_id) !== Number(req.user.user) && req.user.role !== 'ADMIN') {
        // Allow assigned driver too.
        const isDriver = await import('../services/driver.service.js').then((m) =>
            m.getDriverByUserId(req.user.user)
        );
        if (!isDriver || Number(isDriver.id) !== Number(r.driver_id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, ride: r });
});

export const cancelRideController = asyncHandler(async (req, res) => {
    const result = await ride.cancelRide(req.params.id, req.user.user, { reason: req.body?.reason });
    res.json({ success: true, ...result });
});

export const receiptController = asyncHandler(async (req, res) => {
    const data = await ride.getRideReceipt(req.params.id, req.user.user);
    res.json({ success: true, ...data });
});

export const contactDriverController = asyncHandler(async (req, res) => {
    const data = await ride.contactDriver(req.params.id, req.user.user);
    res.json({ success: true, ...data });
});

export const sosController = asyncHandler(async (req, res) => {
    const result = await ride.triggerSos({
        rideId: req.params.id,
        userId: req.user.user,
        lat: req.body?.lat,
        lng: req.body?.lng,
    });
    res.status(201).json({ success: true, ...result });
});

export const shareRideController = asyncHandler(async (req, res) => {
    const result = await ride.getShareRideLink(req.params.id, req.user.user);
    res.json({ success: true, ...result });
});

export const rideEventsController = asyncHandler(async (req, res) => {
    const events = await ride.listRideEvents(req.params.id);
    res.json({ success: true, events });
});

export const payRideController = asyncHandler(async (req, res) => {
    const { method } = req.body;
    const result = await ride.payRide({ rideId: req.params.id, userId: req.user.user, method });
    res.json({ success: true, ...result });
});
