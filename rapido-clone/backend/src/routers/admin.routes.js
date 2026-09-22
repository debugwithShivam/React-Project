import express from 'express';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import * as c from '../controllers/admin.controller.js';

const adminRouter = express.Router();
adminRouter.use(authenticateUser, requireRole('ADMIN'));

// Dashboard
adminRouter.get('/dashboard', c.dashboardController);

// Drivers / KYC
adminRouter.get('/drivers', c.driversController);
adminRouter.get('/drivers/:id', c.driverDetailsController);
adminRouter.patch('/drivers/:id/review', c.reviewDriverController);
adminRouter.patch('/drivers/documents/:docId/review', c.reviewDocumentController);
adminRouter.get('/drivers/documents/:docId/blob', c.documentBlobController);

// Rides
adminRouter.get('/rides', c.adminRidesController);
adminRouter.get('/rides/:id', c.adminRideDetailController);
adminRouter.patch('/rides/:id/cancel', c.adminCancelRideController);

// Users
adminRouter.get('/users', c.adminUsersController);
adminRouter.get('/users/:id', c.adminUserDetailController);
adminRouter.patch('/users/:id/toggle-active', c.adminToggleUserController);
adminRouter.patch('/users/:id', c.adminUpdateUserController);
adminRouter.post('/users/:id/wallet', c.adminAdjustWalletController);

// Coupons
adminRouter.get('/coupons', c.listCouponsController);
adminRouter.post('/coupons', c.createCouponController);
adminRouter.patch('/coupons/:id', c.updateCouponController);
adminRouter.delete('/coupons/:id', c.deleteCouponController);

// Ratings
adminRouter.get('/ratings', c.listRatingsController);
adminRouter.delete('/ratings/:id', c.deleteRatingController);

// Complaints
adminRouter.get('/complaints', c.listComplaintsController);
adminRouter.get('/complaints/:id', c.getComplaintController);
adminRouter.patch('/complaints/:id', c.updateComplaintController);
adminRouter.delete('/complaints/:id', c.deleteComplaintController);

// Notifications
adminRouter.get('/notifications', c.listNotificationsController);
adminRouter.post('/notifications/send', c.sendNotificationController);

// Settings
adminRouter.get('/settings', c.listSettingsController);
adminRouter.patch('/settings', c.updateSettingController);
adminRouter.put('/settings/bulk', c.bulkUpdateSettingsController);

// Dynamic pages
adminRouter.get('/pages', c.listPagesController);
adminRouter.get('/pages/:slugOrId', c.getPageController);
adminRouter.put('/pages', c.upsertPageController);
adminRouter.delete('/pages/:id', c.deletePageController);

// Vehicle types
adminRouter.get('/vehicle-types', c.listVehicleTypesController);
adminRouter.post('/vehicle-types', c.createVehicleTypeController);
adminRouter.patch('/vehicle-types/:id', c.updateVehicleTypeController);
adminRouter.delete('/vehicle-types/:id', c.deleteVehicleTypeController);

// Cities
adminRouter.get('/cities', c.listCitiesController);
adminRouter.post('/cities', c.createCityController);
adminRouter.patch('/cities/:id', c.updateCityController);
adminRouter.delete('/cities/:id', c.deleteCityController);

// Payments
adminRouter.get('/payments', c.listPaymentsController);
adminRouter.post('/payments/:id/refund', c.refundPaymentController);

// Payouts
adminRouter.get('/payouts', c.listPayoutsController);
adminRouter.patch('/payouts/:id', c.processPayoutController);

// Reports
adminRouter.get('/reports/revenue', c.revenueReportController);
adminRouter.get('/reports/rides-by-status', c.ridesByStatusController);

// SOS
adminRouter.get('/sos', c.listSosController);
adminRouter.patch('/sos/:id', c.resolveSosController);

export default adminRouter;
