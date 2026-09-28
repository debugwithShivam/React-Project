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
    if (name !== undefined && !String(name).trim()) throw new ApiError(400, 'Name cannot be empty');
    if (email && !/^\S+@\S+\.\S+$/.test(String(email).trim())) throw new ApiError(400, 'A valid email address is required');
    let profile_image = req.body.profile_image;
    if (req.file?.buffer) {
        // Store as data URL — simple for MVP. For production, use S3/Cloudinary.
        profile_image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    let user;
    try {
        user = await svc.updateUserProfile(req.user.user, {
            ...(name !== undefined ? { name: String(name).trim() } : {}),
            ...(email !== undefined ? { email: email ? String(email).trim().toLowerCase() : null } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(city !== undefined ? { city: city ? String(city).trim() : null } : {}),
            ...(profile_image !== undefined ? { profile_image } : {}),
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'That email or phone number is already in use');
        throw error;
    }
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
