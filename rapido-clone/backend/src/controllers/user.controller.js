import { asyncHandler, ApiError } from '../utils/apiError.js';
import * as svc from '../services/user.service.js';

export const getMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.user;
    if (!userId) throw new ApiError(401, 'Authenticated user id is missing');
    const user = await svc.getUserById(userId);
    res.json({ success: true, user });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
    const { name, email, phone, city } = req.body;
    let profile_image = req.body.profile_image;
    if (req.file?.buffer) {
        // Store as data URL — simple for MVP. For production, use S3/Cloudinary.
        profile_image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const user = await svc.updateUserProfile(req.user.user, { name, email, phone, city, profile_image });
    res.json({ success: true, user });
});

export const saveFcmController = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new ApiError(400, 'token required');
    await svc.saveFcmToken(req.user.user, token);
    res.json({ success: true });
});

export const referralCodeController = asyncHandler(async (req, res) => {
    const code = await svc.ensureReferralCode(req.user.user);
    res.json({ success: true, referralCode: code });
});
