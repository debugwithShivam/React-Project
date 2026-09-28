import { asyncHandler } from '../utils/apiError.js';
import * as methods from '../services/payment-method.service.js';

export const listPaymentMethodsController = asyncHandler(async (req, res) => {
    res.json({ success: true, paymentMethods: await methods.listMethods(req.user.user) });
});

export const addPaymentMethodController = asyncHandler(async (req, res) => {
    const paymentMethod = await methods.addMethod({ userId: req.user.user, upiId: req.body.upiId, label: req.body.label });
    res.status(201).json({ success: true, paymentMethod });
});

export const setDefaultPaymentMethodController = asyncHandler(async (req, res) => {
    const paymentMethods = await methods.setDefaultMethod(req.params.id, req.user.user);
    res.json({ success: true, paymentMethods });
});

export const deletePaymentMethodController = asyncHandler(async (req, res) => {
    res.json({ success: true, ...await methods.deleteMethod(req.params.id, req.user.user) });
});
