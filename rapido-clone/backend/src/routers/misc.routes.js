import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import * as c from '../controllers/misc.controller.js';

const router = Router();

// Public
router.get('/pages', c.publicPagesController);
router.get('/pages/:slug', c.publicPageController);

router.use(authenticateUser);

router.post('/coupons/validate', c.validateCouponController);
router.get('/coupons/mine', c.listMyCouponsController);

router.post('/ratings', c.submitRatingController);
router.get('/ratings/mine', c.myRatingsController);

router.post('/complaints', c.createComplaintController);
router.get('/complaints/mine', c.myComplaintsController);

router.get('/notifications', c.listNotificationsController);
router.patch('/notifications/:id/read', c.markNotificationReadController);
router.patch('/notifications/read-all', c.markAllNotificationsReadController);
router.delete('/notifications/:id', c.deleteNotificationController);

router.post('/payouts/request', requireRole('DRIVER', 'ADMIN'), c.requestPayoutController);
router.get('/payouts/mine', c.myPayoutsController);

export default router;
