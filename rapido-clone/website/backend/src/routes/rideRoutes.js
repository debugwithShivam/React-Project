/**
 * Ride Routes - MVC Route Definitions
 */

const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Calculate Fare Estimate
router.post('/fare-estimate', rideController.calculateFare);

// Ride Management
router.post('/create', verifyToken, rideController.createRide);
router.get('/:id', verifyToken, rideController.getRideById);
router.post('/accept', verifyToken, rideController.acceptRide);
router.post('/start', verifyToken, rideController.startRide);
router.post('/end', verifyToken, rideController.endRide);
router.post('/cancel', verifyToken, rideController.cancelRide);

module.exports = router;
