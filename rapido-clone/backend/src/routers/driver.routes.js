import { Router } from 'express';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import { uploadSingleDocument } from '../middleware/upload.middleware.js';
import * as c from '../controllers/driver.controller.js';

const router = Router();
router.use(authenticateUser, requireRole('DRIVER', 'ADMIN'));

router.post('/online', c.toggleOnlineController);
router.post('/location', c.updateLocationController);

router.get('/profile', c.myProfileController);
router.patch('/profile', c.updateProfileController);

router.get('/documents', c.listDocumentsController);
router.post('/documents', uploadSingleDocument, c.uploadDocumentController);

router.get('/rides/nearby', c.nearbyRideRequestsController);
router.get('/rides/active', c.activeRideController);
router.post('/rides/:rideId/accept', c.acceptRideController);
router.post('/rides/:rideId/reject', c.rejectRideController);
router.post('/rides/:rideId/arrive', c.markArrivedController);
router.post('/rides/:rideId/start', c.startRideController);
router.post('/rides/:rideId/complete', c.completeRideController);
router.post('/rides/:rideId/cancel', c.cancelRideByDriverController);

router.get('/trips', c.tripsController);
router.get('/earnings', c.earningsController);

export default router;
