import {
    registerUser,
    loginUser,
    refreshUserToken,
    logoutUser,
    requestPasswordReset,
    resetUserPassword,
} from '../services/auth.service.js';

export async function Authcontroller(req, res) {
    console.log(req.body);
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            return res.json({
                success: false,
                message: 'Name, phone, email and password are required',
            });
        }

        const user = await registerUser({ name, phone, email, password });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user,
        });
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/phone and password are required',
            });
        }

        const result = await loginUser({ identifier, password });

        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone is required',
            });
        }

        const result = await requestPasswordReset({ email, phone });

        return res.status(200).json({
            success: true,
            message: 'Password reset token generated successfully',
            email: result.email,
            resetToken: result.resetToken,
        });
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required',
            });
        }

        await resetUserPassword({ token, newPassword });

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const result = await refreshUserToken(refreshToken);

        return res.status(200).json({
            success: true,
            accessToken: result.accessToken,
        });
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await logoutUser(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};