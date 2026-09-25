import { asyncHandler } from '../utils/apiError.js';
import * as chat from '../services/chat.service.js';

export const listMessagesController = asyncHandler(async (req, res) => {
    const messages = await chat.listMessages(req.params.id, req.user.user);
    res.json({ success: true, messages });
});

export const sendMessageController = asyncHandler(async (req, res) => {
    const message = await chat.sendMessage({
        rideId: req.params.id,
        senderId: req.user.user,
        body: req.body?.body,
    });
    res.status(201).json({ success: true, message });
});

export const markReadController = asyncHandler(async (req, res) => {
    const result = await chat.markRead(req.params.id, req.user.user);
    res.json({ success: true, ...result });
});
