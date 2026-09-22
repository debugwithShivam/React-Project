import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { uploadProfileImage } from '../middleware/upload.middleware.js';
import * as c from '../controllers/user.controller.js';

const router = Router();
router.use(authenticateUser);

router.get('/me', c.getMyProfile);
router.patch('/me', uploadProfileImage, c.updateMyProfile);
router.post('/me/fcm-token', c.saveFcmController);
router.get('/me/referral-code', c.referralCodeController);

export default router;
