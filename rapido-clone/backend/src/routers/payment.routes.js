import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import * as c from '../controllers/payment.controller.js';

const router = Router();

router.get('/config', c.razorpayConfigController);

router.use(authenticateUser);
router.post('/order', c.createOrderController);
router.post('/verify', c.verifyPaymentController);
router.get('/history', c.myPaymentsController);

router.get('/wallet', c.walletController);
router.get('/wallet/transactions', c.walletTxController);

export default router;
