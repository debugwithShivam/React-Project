import { Router } from 'express';

import {
    Authcontroller,
    login,
    refreshToken,
    logout,
    forgotPassword,
    changeAdminPassword,
    resetPassword,
} from '../controllers/auth.controller.js';
import { uploadDriverDocuments } from '../middleware/upload.middleware.js';
import { authenticateUser, requireRole } from '../middleware/auth.middleware.js';
import {
    authRateLimiter,
    passwordResetRateLimiter,
} from '../middleware/rateLimit.middleware.js';

const authRouter = Router();

// Registration: rate-limited to prevent mass account creation
authRouter.post('/register', authRateLimiter, uploadDriverDocuments, Authcontroller);

// Login: rate-limited to prevent brute force
authRouter.post('/login', authRateLimiter, login);

// Admin password change: protected + rate-limited
authRouter.post(
    '/changeAdminPassword',
    authRateLimiter,
    authenticateUser,
    requireRole('ADMIN'),
    changeAdminPassword
);

// Password reset: dedicated tighter limiter
authRouter.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
authRouter.post('/reset-password', passwordResetRateLimiter, resetPassword);

// Token refresh and logout: rate-limited to prevent token harvesting
authRouter.post('/refreshToken', authRateLimiter, refreshToken);
authRouter.post('/logout', authRateLimiter, logout);

export default authRouter;
