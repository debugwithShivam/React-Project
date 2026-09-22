import { asyncHandler } from '../utils/apiError.js';
import * as svc from '../services/coupon.service.js';
import * as rating from '../services/rating.service.js';
import * as complaint from '../services/complaint.service.js';
import * as notif from '../services/notification.service.js';
import * as page from '../services/dynamicPage.service.js';
import * as payout from '../services/payout.service.js';

// ---------- coupons ----------
export const validateCouponController = asyncHandler(async (req, res) => {
    const { code, fare, vehicleType } = req.body;
    const result = await svc.validateCoupon({
        code,
        userId: req.user.user,
        fare,
        vehicleType,
        role: req.user.role,
    });
    res.json({ success: true, ...result });
});

export const listMyCouponsController = asyncHandler(async (req, res) => {
    const { fare, vehicleType } = req.query;
    const coupons = await svc.listCouponsForUser({
        userId: req.user.user,
        fare: Number(fare || 0),
        vehicleType,
        role: req.user.role,
    });
    res.json({ success: true, coupons });
});

// ---------- ratings ----------
export const submitRatingController = asyncHandler(async (req, res) => {
    const { rideId, rating: value, comment } = req.body;
    const result = await rating.submitRating({
        rideId,
        raterId: req.user.user,
        raterRole: req.user.role === 'DRIVER' ? 'DRIVER' : 'USER',
        rating: value,
        comment,
    });
    res.status(201).json({ success: true, rating: result });
});

export const myRatingsController = asyncHandler(async (req, res) => {
    const ratings = await rating.listRatingsForUser(req.user.user);
    res.json({ success: true, ratings });
});

// ---------- complaints / support ----------
export const createComplaintController = asyncHandler(async (req, res) => {
    const result = await complaint.createComplaint({
        userId: req.user.user,
        rideId: req.body.rideId || null,
        subject: req.body.subject,
        description: req.body.description,
        category: req.body.category || 'GENERAL',
        priority: req.body.priority || 'MEDIUM',
    });
    res.status(201).json({ success: true, complaint: result });
});

export const myComplaintsController = asyncHandler(async (req, res) => {
    const complaints = await complaint.listComplaintsForUser(req.user.user);
    res.json({ success: true, complaints });
});

// ---------- notifications ----------
export const listNotificationsController = asyncHandler(async (req, res) => {
    const items = await notif.listNotifications(req.user.user, {
        unreadOnly: req.query.unreadOnly === 'true',
        limit: Number(req.query.limit || 50),
    });
    res.json({ success: true, notifications: items });
});

export const markNotificationReadController = asyncHandler(async (req, res) => {
    await notif.markRead(req.user.user, req.params.id);
    res.json({ success: true });
});

export const markAllNotificationsReadController = asyncHandler(async (req, res) => {
    await notif.markAllRead(req.user.user);
    res.json({ success: true });
});

export const deleteNotificationController = asyncHandler(async (req, res) => {
    await notif.deleteNotification(req.user.user, req.params.id);
    res.json({ success: true });
});

// ---------- public dynamic pages ----------
export const publicPageController = asyncHandler(async (req, res) => {
    const p = await page.getPageBySlug(req.params.slug);
    if (!p) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page: p });
});

export const publicPagesController = asyncHandler(async (req, res) => {
    const pages = await page.listPages();
    res.json({ success: true, pages });
});

// ---------- payouts (driver) ----------
export const requestPayoutController = asyncHandler(async (req, res) => {
    const { amount, upi } = req.body;
    const result = await payout.requestPayout({ driverUserId: req.user.user, amount, upi });
    res.status(201).json({ success: true, payout: result });
});

export const myPayoutsController = asyncHandler(async (req, res) => {
    const payouts = await payout.listPayoutsForDriver(req.user.user);
    res.json({ success: true, payouts });
});
