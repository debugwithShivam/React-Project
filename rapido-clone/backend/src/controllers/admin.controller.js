import { asyncHandler, ApiError } from '../utils/apiError.js';
import * as admin from '../services/admin.service.js';
import * as coupon from '../services/coupon.service.js';
import * as rating from '../services/rating.service.js';
import * as complaint from '../services/complaint.service.js';
import * as notif from '../services/notification.service.js';
import * as page from '../services/dynamicPage.service.js';
import * as settings from '../services/settings.service.js';
import * as vehicle from '../services/vehicle.service.js';
import * as city from '../services/city.service.js';
import * as payment from '../services/payment.service.js';
import * as payout from '../services/payout.service.js';
import { emitToAdmins } from '../socket/index.js';

// ================= Dashboard =================
export const dashboardController = asyncHandler(async (req, res) => {
    res.json({ success: true, stats: await admin.getDashboardStats() });
});

// ================= Drivers / KYC =================
export const driversController = asyncHandler(async (req, res) => {
    const { status, city, search, limit, offset } = req.query;
    const drivers = await admin.listDrivers({ status, city, search, limit: Number(limit || 200), offset: Number(offset || 0) });
    res.json({ success: true, drivers });
});

export const driverDetailsController = asyncHandler(async (req, res) => {
    const driver = await admin.getDriverDetails(req.params.id);
    if (!driver) throw new ApiError(404, 'Driver not found');
    res.json({ success: true, driver });
});

export const reviewDriverController = asyncHandler(async (req, res) => {
    const driver = await admin.reviewDriver({
        driverId: req.params.id,
        status: req.body.status,
        rejectionReason: req.body.rejectionReason || req.body.reason,
    });
    if (!driver) throw new ApiError(404, 'Driver not found');
    emitToAdmins('admin:driver-reviewed', { driverId: req.params.id, status: req.body.status });
    res.json({ success: true, driver });
});

export const reviewDocumentController = asyncHandler(async (req, res) => {
    await admin.reviewDocument({ documentId: req.params.docId, status: req.body.status });
    res.json({ success: true });
});

export const documentBlobController = asyncHandler(async (req, res) => {
    const doc = await admin.getDocumentBlob(req.params.docId);
    if (!doc || !doc.file_data) throw new ApiError(404, 'Document not found');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name || 'document'}"`);
    res.send(doc.file_data);
});

// ================= Rides =================
export const adminRidesController = asyncHandler(async (req, res) => {
    const { status, from, to, search, limit, offset } = req.query;
    const rides = await admin.listAllRides({ status, from, to, search, limit: Number(limit || 200), offset: Number(offset || 0) });
    res.json({ success: true, rides });
});

export const adminRideDetailController = asyncHandler(async (req, res) => {
    const ride = await admin.getRideDetail(req.params.id);
    if (!ride) throw new ApiError(404, 'Ride not found');
    res.json({ success: true, ride });
});

export const adminCancelRideController = asyncHandler(async (req, res) => {
    const result = await admin.adminCancelRide({ rideId: req.params.id, reason: req.body?.reason });
    emitToAdmins('admin:ride-updated', result);
    res.json({ success: true, ...result });
});

// ================= Users =================
export const adminUsersController = asyncHandler(async (req, res) => {
    const { role, search, isActive, limit, offset } = req.query;
    const users = await admin.listUsers({ role, search, isActive, limit: Number(limit || 200), offset: Number(offset || 0) });
    res.json({ success: true, users });
});

export const adminUserDetailController = asyncHandler(async (req, res) => {
    const user = await admin.getUserDetail(req.params.id);
    res.json({ success: true, user });
});

export const adminToggleUserController = asyncHandler(async (req, res) => {
    const result = await admin.toggleUserActive(req.params.id, req.body.isActive);
    res.json({ success: true, ...result });
});

export const adminUpdateUserController = asyncHandler(async (req, res) => {
    const user = await admin.adminUpdateUser(req.params.id, req.body);
    res.json({ success: true, user });
});

export const adminAdjustWalletController = asyncHandler(async (req, res) => {
    const { amount, type, reason } = req.body;
    const result = await admin.adjustUserWallet({ userId: req.params.id, amount, type, reason: reason || 'ADMIN_ADJUSTMENT' });
    res.json({ success: true, ...result });
});

// ================= Coupons =================
export const listCouponsController = asyncHandler(async (req, res) => {
    const coupons = await coupon.listCoupons({ includeInactive: req.query.includeInactive === 'true' });
    res.json({ success: true, coupons });
});

export const createCouponController = asyncHandler(async (req, res) => {
    const c = await coupon.createCoupon(req.body, req.user.user);
    res.status(201).json({ success: true, coupon: c });
});

export const updateCouponController = asyncHandler(async (req, res) => {
    const c = await coupon.updateCoupon(req.params.id, req.body);
    res.json({ success: true, coupon: c });
});

export const deleteCouponController = asyncHandler(async (req, res) => {
    await coupon.deleteCoupon(req.params.id);
    res.json({ success: true });
});

// ================= Ratings =================
export const listRatingsController = asyncHandler(async (req, res) => {
    const ratings = await rating.listAllRatings({
        rating: req.query.rating,
        limit: Number(req.query.limit || 200),
        offset: Number(req.query.offset || 0),
    });
    res.json({ success: true, ratings });
});

export const deleteRatingController = asyncHandler(async (req, res) => {
    await rating.deleteRating(req.params.id);
    res.json({ success: true });
});

// ================= Complaints =================
export const listComplaintsController = asyncHandler(async (req, res) => {
    const complaints = await complaint.listAllComplaints({
        status: req.query.status,
        limit: Number(req.query.limit || 200),
        offset: Number(req.query.offset || 0),
    });
    res.json({ success: true, complaints });
});

export const getComplaintController = asyncHandler(async (req, res) => {
    const c = await complaint.getComplaint(req.params.id);
    if (!c) throw new ApiError(404, 'Complaint not found');
    res.json({ success: true, complaint: c });
});

export const updateComplaintController = asyncHandler(async (req, res) => {
    const { status, priority, assignedTo, resolution } = req.body;
    const c = await complaint.updateComplaint(req.params.id, { status, priority, assignedTo, resolution });
    res.json({ success: true, complaint: c });
});

export const deleteComplaintController = asyncHandler(async (req, res) => {
    await complaint.deleteComplaint(req.params.id);
    res.json({ success: true });
});

// ================= Notifications =================
export const sendNotificationController = asyncHandler(async (req, res) => {
    const { userIds, role, title, body, type = 'BROADCAST' } = req.body;
    if (userIds?.length) {
        for (const uid of userIds)
            await notif.createNotification({ userId: uid, title, body, type });
        return res.json({ success: true, sent: userIds.length });
    }
    const result = await notif.adminBroadcast({ title, body, type, role });
    res.json({ success: true, ...result });
});

export const listNotificationsController = asyncHandler(async (req, res) => {
    const items = await notif.adminListAll({
        limit: Number(req.query.limit || 200),
        offset: Number(req.query.offset || 0),
    });
    res.json({ success: true, notifications: items });
});

// ================= Settings =================
export const listSettingsController = asyncHandler(async (req, res) => {
    const rows = await settings.listSettingsRows();
    res.json({ success: true, settings: rows });
});

export const updateSettingController = asyncHandler(async (req, res) => {
    const { key, value, valueType, group, description } = req.body;
    if (!key) throw new ApiError(400, 'key required');
    await settings.setSetting(key, value, { valueType, group, description });
    res.json({ success: true });
});

export const bulkUpdateSettingsController = asyncHandler(async (req, res) => {
    const entries = req.body?.settings || req.body;
    if (typeof entries !== 'object') throw new ApiError(400, 'settings object required');
    for (const [k, v] of Object.entries(entries)) await settings.setSetting(k, v);
    res.json({ success: true, updated: Object.keys(entries).length });
});

// ================= Dynamic pages =================
export const listPagesController = asyncHandler(async (req, res) => {
    const pages = await page.listPages({ includeUnpublished: true });
    res.json({ success: true, pages });
});

export const getPageController = asyncHandler(async (req, res) => {
    const p = await page.adminGetPage(req.params.slugOrId);
    if (!p) throw new ApiError(404, 'Page not found');
    res.json({ success: true, page: p });
});

export const upsertPageController = asyncHandler(async (req, res) => {
    const p = await page.upsertPage(req.body);
    res.json({ success: true, page: p });
});

export const deletePageController = asyncHandler(async (req, res) => {
    await page.deletePage(req.params.id);
    res.json({ success: true });
});

// ================= Vehicle types =================
export const listVehicleTypesController = asyncHandler(async (req, res) => {
    const vehicles = await vehicle.listVehicleTypes({ includeInactive: true });
    res.json({ success: true, vehicles });
});

export const createVehicleTypeController = asyncHandler(async (req, res) => {
    const v = await vehicle.createVehicleType(req.body);
    res.status(201).json({ success: true, vehicle: v });
});

export const updateVehicleTypeController = asyncHandler(async (req, res) => {
    const v = await vehicle.updateVehicleType(req.params.id, req.body);
    res.json({ success: true, vehicle: v });
});

export const deleteVehicleTypeController = asyncHandler(async (req, res) => {
    await vehicle.deleteVehicleType(req.params.id);
    res.json({ success: true });
});

// ================= Cities =================
export const listCitiesController = asyncHandler(async (req, res) => {
    const cities = await city.listCities({ includeInactive: true });
    res.json({ success: true, cities });
});

export const createCityController = asyncHandler(async (req, res) => {
    const c = await city.createCity(req.body);
    res.status(201).json({ success: true, city: c });
});

export const updateCityController = asyncHandler(async (req, res) => {
    const c = await city.updateCity(req.params.id, req.body);
    res.json({ success: true, city: c });
});

export const deleteCityController = asyncHandler(async (req, res) => {
    await city.deleteCity(req.params.id);
    res.json({ success: true });
});

// ================= Payments =================
export const listPaymentsController = asyncHandler(async (req, res) => {
    const { status, method, limit, offset } = req.query;
    const payments = await payment.listAllPayments({
        status,
        method,
        limit: Number(limit || 200),
        offset: Number(offset || 0),
    });
    res.json({ success: true, payments });
});

export const refundPaymentController = asyncHandler(async (req, res) => {
    const { amount, reason } = req.body;
    const result = await payment.refundPayment({ paymentId: req.params.id, amount, reason });
    res.json({ success: true, ...result });
});

// ================= Payouts =================
export const listPayoutsController = asyncHandler(async (req, res) => {
    const payouts = await payout.listAllPayouts({
        status: req.query.status,
        limit: Number(req.query.limit || 200),
        offset: Number(req.query.offset || 0),
    });
    res.json({ success: true, payouts });
});

export const processPayoutController = asyncHandler(async (req, res) => {
    const { status, notes, referenceNumber } = req.body;
    const result = await payout.processPayout({
        payoutId: req.params.id,
        status,
        adminId: req.user.user,
        notes,
        referenceNumber,
    });
    res.json({ success: true, payout: result });
});

// ================= Reports =================
export const revenueReportController = asyncHandler(async (req, res) => {
    const { from, to, groupBy } = req.query;
    const report = await admin.getRevenueReport({ from, to, groupBy });
    res.json({ success: true, report });
});

export const ridesByStatusController = asyncHandler(async (req, res) => {
    const rows = await admin.getRidesByStatus();
    res.json({ success: true, ridesByStatus: rows });
});

// ================= SOS =================
export const listSosController = asyncHandler(async (req, res) => {
    const { default: pool } = await import('../config/DBconfig/database.js');
    const [rows] = await pool.execute(
        `SELECT s.*, u.name AS user_name, u.phone AS user_phone,
                d.name AS driver_name, d.phone AS driver_phone
         FROM sos_alerts s
         JOIN users u ON u.id = s.user_id
         JOIN rides r ON r.id = s.ride_id
         LEFT JOIN drivers dr ON dr.id = r.driver_id
         LEFT JOIN users d ON d.id = dr.user_id
         ORDER BY s.created_at DESC LIMIT 200`
    );
    res.json({ success: true, alerts: rows });
});

export const resolveSosController = asyncHandler(async (req, res) => {
    const { default: pool } = await import('../config/DBconfig/database.js');
    const { status = 'RESOLVED', notes } = req.body;
    await pool.execute(
        `UPDATE sos_alerts SET status = ?, resolved_by = ?, resolved_at = NOW(), notes = ? WHERE id = ?`,
        [status, req.user.user, notes || null, req.params.id]
    );
    res.json({ success: true });
});
