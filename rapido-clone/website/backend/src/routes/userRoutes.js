/**
 * User Routes - MVC Route Definitions
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Authenticated user endpoints
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.get('/rides', verifyToken, userController.getUserRides);

module.exports = router;
