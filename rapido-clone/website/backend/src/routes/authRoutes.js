/**
 * Auth Routes - MVC Route Definitions
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User Auth
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Captain Auth
router.post('/captain/register', authController.registerCaptain);
router.post('/captain/login', authController.loginCaptain);

// OTP Verification
router.post('/otp/send', authController.sendOtp);
router.post('/otp/verify', authController.verifyOtp);

module.exports = router;
