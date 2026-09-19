import bcrypt from 'bcrypt';
import pool from '../config/DBconfig/database.js';

import {
    registerUser,
    loginUser,
    refreshUserToken,
    logoutUser,
    requestPasswordReset,
    resetUserPassword,
} from '../services/auth.service.js';

import {
    generateAccessToken,
    generateRefreshToken,
} from '../utils/token.js';


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
        // GENERATE TOKENS
        // ===============================
        const accessToken = generateAccessToken({
            id: user.id,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            role: user.role,
        });

        // ===============================
        // STORE REFRESH TOKEN HASH
        // ===============================
        const refreshTokenHash = await bcrypt.hash(
            refreshToken,
            12
        );

        await pool.query(
            `
            INSERT INTO refresh_tokens
            (
                user_id,
                token_hash,
                expires_at
            )
            VALUES
            (
                ?,
                ?,
                DATE_ADD(NOW(), INTERVAL 7 DAY)
            )
            `,
            [
                user.id,
                refreshTokenHash,
            ]
        );

        // ===============================
        // SET AUTH COOKIES
        // ===============================
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
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
            user,
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
        console.log("LOGIN BODY:", req.body);
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
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
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
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        const result = await refreshUserToken(refreshToken);

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
        });

    } catch (error) {
        console.error('REFRESH TOKEN ERROR:', error);

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
        const refreshToken = req.cookies.refreshToken;

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
        console.error('LOGOUT ERROR:', error);

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
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const result = await requestPasswordReset(
            email.trim().toLowerCase()
        );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Password reset request failed',
        });
    }
};


// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
    try {
        const {
            token,
            password,
        } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and password are required',
            });
        }

        const result = await resetUserPassword(
            token,
            password
        );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('RESET PASSWORD ERROR:', error);

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
        console.error('CHANGE ADMIN PASSWORD ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to change password',
        });
    }
};