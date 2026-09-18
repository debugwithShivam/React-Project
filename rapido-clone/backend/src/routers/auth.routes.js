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
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', uploadDriverDocuments, Authcontroller);
authRouter.post('/login', login);

authRouter.post('/changeAdminPassword',authenticateUser,
requireRole('ADMIN'),changeAdminPassword
);

authRouter.post(
    '/forgot-password',
    forgotPassword
);

authRouter.post(
    '/reset-password',
    resetPassword
);

authRouter.post(
    '/refreshToken',
    refreshToken
);

authRouter.post(
    '/logout',
    logout
);

export default authRouter;