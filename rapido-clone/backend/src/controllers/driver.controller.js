import { asyncHandler } from '../utils/apiError.js';
import * as svc from '../services/driver.service.js';
import { findNearbyDrivers } from '../services/matching.service.js';
import { getActiveRideForDriver } from '../services/ride.service.js';

export const activeRideController = asyncHandler(async (req, res) => {
    const ride = await getActiveRideForDriver(req.user.user);
    res.json({ success: true, ride });
});

export const toggleOnlineController = asyncHandler(async (req, res) => {
    const { isOnline, lat, lng } = req.body;
    const result = await svc.toggleOnline({ driverUserId: req.user.user, isOnline, lat, lng });
    res.json({ success: true, ...result });
});

export const updateLocationController = asyncHandler(async (req, res) => {
    const { lat, lng, heading, speed } = req.body;
    await svc.updateLocation({ driverUserId: req.user.user, lat, lng, heading, speed });
    res.json({ success: true });
});

export const myProfileController = asyncHandler(async (req, res) => {
    const driver = await svc.getDriverByUserId(req.user.user);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    res.json({ success: true, driver });
});

export const updateProfileController = asyncHandler(async (req, res) => {
    const driver = await svc.updateDriverProfile({ driverUserId: req.user.user, patch: req.body });
    res.json({ success: true, driver });
});

export const listDocumentsController = asyncHandler(async (req, res) => {
    const docs = await svc.listDriverDocuments(req.user.user);
    res.json({ success: true, documents: docs });
});

export const uploadDocumentController = asyncHandler(async (req, res) => {
    const { documentType, documentSide } = req.body;
    const file = req.file;
    const result = await svc.uploadAdditionalDocument({
        driverUserId: req.user.user,
        documentType,
        documentSide,
        file,
    });
    res.status(201).json({ success: true, ...result });
});

export const nearbyRideRequestsController = asyncHandler(async (req, res) => {
    const radiusKm = Number(req.query.radiusKm || 5);
    const rides = await svc.listNearbyRideRequests({ driverUserId: req.user.user, radiusKm });
    res.json({ success: true, rides });
});

export const nearbyDriversController = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 5, vehicleType } = req.query;
    const drivers = await findNearbyDrivers({ lat, lng, radiusKm, vehicleType });
    res.json({ success: true, drivers });
});

export const acceptRideController = asyncHandler(async (req, res) => {
    const result = await svc.acceptRide({ driverUserId: req.user.user, rideId: req.params.rideId });
    res.json({ success: true, ...result });
});

export const rejectRideController = asyncHandler(async (req, res) => {
    const result = await svc.rejectRide({
        driverUserId: req.user.user,
        rideId: req.params.rideId,
        reason: req.body?.reason,
    });
    res.json({ success: true, ...result });
});

export const markArrivedController = asyncHandler(async (req, res) => {
    const result = await svc.markArrived({
        driverUserId: req.user.user,
        rideId: req.params.rideId,
        lat: req.body?.lat,
        lng: req.body?.lng,
    });
    res.json({ success: true, ...result });
});

export const startRideController = asyncHandler(async (req, res) => {
    const result = await svc.startRide({
        driverUserId: req.user.user,
        rideId: req.params.rideId,
        otp: req.body?.otp,
    });
    res.json({ success: true, ...result });
});

export const completeRideController = asyncHandler(async (req, res) => {
    const result = await svc.completeRide({
        driverUserId: req.user.user,
        rideId: req.params.rideId,
        finalFare: req.body?.finalFare,
        distanceKm: req.body?.distanceKm,
        durationMin: req.body?.durationMin,
    });
    res.json({ success: true, ...result });
});

export const cancelRideByDriverController = asyncHandler(async (req, res) => {
    const result = await svc.cancelRideByDriver({
        driverUserId: req.user.user,
        rideId: req.params.rideId,
        reason: req.body?.reason,
    });
    res.json({ success: true, ...result });
});

export const tripsController = asyncHandler(async (req, res) => {
    const { status, limit, offset } = req.query;
    const trips = await svc.listDriverTrips({
        driverUserId: req.user.user,
        status,
        limit: Number(limit || 50),
        offset: Number(offset || 0),
    });
    res.json({ success: true, trips });
});

export const earningsController = asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const earnings = await svc.getDriverEarnings({ driverUserId: req.user.user, from, to });
    res.json({ success: true, earnings });
});
