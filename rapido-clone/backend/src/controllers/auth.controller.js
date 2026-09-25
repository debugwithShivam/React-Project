import {
    registerUser,
    loginUser,
    refreshUserToken,
    logoutUser,
    requestPasswordReset,
    resetUserPassword,
} from '../services/auth.service.js';


// ===============================
// REGISTER
// ===============================
export const Authcontroller = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            password,
            role,
            city,
            vehicleType,
            vehicleModel,
            vehiclePlate,
            drivingLicense,
            aadhaarNumber,
            payoutUpi,
        } = req.body;

        const normalizedName = name?.trim();
        const normalizedPhone = phone?.trim();
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedRole = role?.trim().toUpperCase();

        if (
            !normalizedName ||
            !normalizedPhone ||
            !normalizedEmail ||
            !password ||
            !normalizedRole
        ) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone, email, password and role are required',
            });
        }

        if (!['USER', 'DRIVER'].includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role',
            });
        }

        const user = await registerUser({
            name: normalizedName,
            phone: normalizedPhone,
            email: normalizedEmail,
            password,
            role: normalizedRole,
            city,
            vehicleType,
            vehicleModel,
            vehiclePlate,
            drivingLicense,
            aadhaarNumber,
            payoutUpi,
            files: req.files,
        });

        // ===============================
        // SET AUTH COOKIES
        // ===============================
        res.cookie('accessToken', user.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', user.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message:
                normalizedRole === 'DRIVER'
                    ? 'Driver application submitted successfully'
                    : 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                driver: user.driver
            },
        });

    } catch (error) {
        console.error('REGISTER ERROR:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
};


// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
    try {

        const {
            identifier,
            password,
            role,
        } = req.body;

        const normalizedRole = role?.trim().toUpperCase();

        if (!identifier || !password || !normalizedRole) {
            return res.status(400).json({
                success: false,
                message: 'Identifier, password and role are required',
            });
        }

        const result = await loginUser({
            identifier,
            password,
            role: normalizedRole,
        });

        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: result.user,
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error);

        return res.status(401).json({
            success: false,
            message: error.message || 'Login failed',
        });
    }
};


// ===============================
// REFRESH TOKEN
// ===============================
export const refreshToken = async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        const result = await refreshUserToken(incomingRefreshToken);

        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            user: result.user,
        });

    } catch (error) {
        // Do not log full error -- may contain token data.

        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid refresh token',
        });
    }
};


// ===============================
// LOGOUT
// ===============================
export const logout = async (req, res) => {
    try {
        // Mobile clients (SecureStore) send the token in the body;
        // web clients send it as an httpOnly cookie.
        const refreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (refreshToken) {
            await logoutUser(refreshToken);
        }

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return res.status(200).json({
            success: true,
            message: 'Logout successful',
        });

    } catch (error) {
        // Suppress logout error log.

        return res.status(500).json({
            success: false,
            message: error.message || 'Logout failed',
        });
    }
};


// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req, res) => {
    // SECURITY: always return the same generic 200 regardless of whether
    // the account exists, to prevent account enumeration.
    const GENERIC_OK = {
        success: true,
        message: 'If an account exists with these details, a reset link has been sent.',
    };

    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone is required',
            });
        }

        await requestPasswordReset({
            email: email ? String(email).trim().toLowerCase() : null,
            phone: phone ? String(phone).trim() : null,
        });

        // Reset token is NOT returned in response; it must be delivered via email/SMS.
        return res.status(200).json(GENERIC_OK);
    } catch (error) {
        // Do NOT surface the error message — it might reveal account existence.
        return res.status(200).json(GENERIC_OK);
    }
};


// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
    try {
        const { token, password, newPassword } = req.body;

        const finalPassword = password || newPassword;

        if (!token || !finalPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and password are required',
            });
        }

        await resetUserPassword({
            token,
            newPassword: finalPassword,
        });

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        // Do not log full error -- may contain token data.

        return res.status(400).json({
            success: false,
            message: error.message || 'Password reset failed',
        });
    }
};


export const changeAdminPassword = async (req, res) => {
    try {
        const adminId = req.user.user;

        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters',
            });
        }

        const [users] = await pool.query(
            `
            SELECT
                id,
                password_hash,
                role
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [adminId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin account not found',
            });
        }

        const admin = users[0];

        if (admin.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required',
            });
        }

        const passwordMatched = await bcrypt.compare(
            currentPassword,
            admin.password_hash
        );

        if (!passwordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        const newPasswordHash = await bcrypt.hash(
            newPassword,
            12
        );

        await pool.query(
            `
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
            `,
            [
                newPasswordHash,
                adminId,
            ]
        );

        return res.status(200).json({
            success: true,
            message: 'Admin password updated successfully',
        });

    } catch (error) {
        // Do not log full error.

        return res.status(500).json({
            success: false,
            message: 'Failed to change password',
        });
    }
};