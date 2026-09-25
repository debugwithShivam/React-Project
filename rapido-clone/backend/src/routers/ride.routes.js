import express from 'express';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import * as c from '../controllers/ride.controller.js';
import * as chat from '../controllers/chat.controller.js';

const rideRouter = express.Router();

// Public-ish (still authenticated)
rideRouter.get('/rides/fare-estimate', authenticateUser, c.fareEstimateController);
rideRouter.get('/rides/nearby-vehicles', authenticateUser, c.nearbyVehiclesController);

rideRouter.post('/rides', authenticateUser, requireRole('USER', 'ADMIN'), c.createRideController);
rideRouter.get('/rides/my', authenticateUser, c.getMyRidesController);
rideRouter.get('/rides/active', authenticateUser, c.getActiveRideController);
rideRouter.get('/rides/:id', authenticateUser, c.getRideDetailController);
rideRouter.get('/rides/:id/receipt', authenticateUser, c.receiptController);
rideRouter.get('/rides/:id/events', authenticateUser, c.rideEventsController);
rideRouter.get('/rides/:id/contact-driver', authenticateUser, c.contactDriverController);
rideRouter.get('/rides/:id/share', authenticateUser, c.shareRideController);
rideRouter.patch('/rides/:id/cancel', authenticateUser, c.cancelRideController);
rideRouter.post('/rides/:id/sos', authenticateUser, c.sosController);
rideRouter.post('/rides/:id/pay', authenticateUser, c.payRideController);

// Ride chat (user <-> assigned driver). Authorization is per-ride inside the service.
rideRouter.get('/rides/:id/messages', authenticateUser, chat.listMessagesController);
rideRouter.post('/rides/:id/messages', authenticateUser, chat.sendMessageController);
rideRouter.patch('/rides/:id/messages/read', authenticateUser, chat.markReadController);

export default rideRouter;
