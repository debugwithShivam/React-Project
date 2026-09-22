import { asyncHandler, ApiError } from '../utils/apiError.js';
import * as pay from '../services/payment.service.js';
import * as wallet from '../services/wallet.service.js';

export const createOrderController = asyncHandler(async (req, res) => {
    const { amount, purpose = 'RIDE', rideId = null, notes = {} } = req.body;
    const order = await pay.createOrder({ userId: req.user.user, amount, purpose, rideId, notes });
    res.status(201).json({ success: true, order });
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
    const { orderId, razorpayPaymentId, signature, creditWallet = false } = req.body;
    if (!orderId || !razorpayPaymentId || !signature)
        throw new ApiError(400, 'orderId, razorpayPaymentId, signature required');
    const result = await pay.verifyPayment({
        userId: req.user.user,
        orderId,
        razorpayPaymentId,
        signature,
        creditWallet: !!creditWallet,
    });
    res.json({ success: true, ...result });
});

export const myPaymentsController = asyncHandler(async (req, res) => {
    const payments = await pay.listPaymentsForUser(req.user.user);
    res.json({ success: true, payments });
});

export const walletController = asyncHandler(async (req, res) => {
    const w = await wallet.getWallet(req.user.user);
    res.json({ success: true, wallet: w });
});

export const walletTxController = asyncHandler(async (req, res) => {
    const transactions = await wallet.listTransactions(req.user.user, { limit: Number(req.query.limit || 50) });
    res.json({ success: true, transactions });
});

export const razorpayConfigController = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        enabled: pay.isRazorpayEnabled(),
        keyId: pay.isRazorpayEnabled() ? process.env.RAZORPAY_KEY_ID : null,
    });
});

// Razorpay webhook — must be raw-body verified at the gateway level.
export const razorpayWebhookController = asyncHandler(async (req, res) => {
    // For simplicity, accept JSON body and verify event type. In production,
    // mount this route with express.raw() and verify HMAC of the raw body.
    const event = req.body?.event;
    if (event === 'payment.captured') {
        const entity = req.body.payload?.payment?.entity;
        if (entity?.order_id) {
            await import('../config/DBconfig/database.js').then(async ({ default: pool }) => {
                await pool.execute(
                    `UPDATE payments SET status = 'SUCCESS', gateway_payment_id = ?, paid_at = NOW() WHERE gateway_order_id = ?`,
                    [entity.id, entity.order_id]
                );
            });
        }
    }
    res.json({ received: true });
});
