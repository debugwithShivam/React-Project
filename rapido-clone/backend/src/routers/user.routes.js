import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { uploadProfileImage } from '../middleware/upload.middleware.js';
import * as c from '../controllers/user.controller.js';
import * as places from '../controllers/place.controller.js';
import * as methods from '../controllers/payment-method.controller.js';

const router = Router();
router.use(authenticateUser);

router.get('/me', c.getMyProfile);
router.patch('/me', uploadProfileImage, c.updateMyProfile);
router.post('/me/fcm-token', c.saveFcmController);
router.get('/me/referral-code', c.referralCodeController);
router.get('/me/places', places.listPlacesController);
router.post('/me/places', places.addPlaceController);
router.patch('/me/places/:id', places.updatePlaceController);
router.delete('/me/places/:id', places.deletePlaceController);
router.get('/me/payment-methods', methods.listPaymentMethodsController);
router.post('/me/payment-methods', methods.addPaymentMethodController);
router.patch('/me/payment-methods/:id/default', methods.setDefaultPaymentMethodController);
router.delete('/me/payment-methods/:id', methods.deletePaymentMethodController);

export default router;
