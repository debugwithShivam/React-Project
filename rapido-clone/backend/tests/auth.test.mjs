import { createPool } from 'mysql2/promise';
import { mock } from 'node:test';

const mockConnection = {
    query: mock.fn(),
    beginTransaction: mock.fn(),
    commit: mock.fn(),
    rollback: mock.fn(),
    release: mock.fn(),
};

const mockPool = {
    getConnection: mock.fn(() => mockConnection),
    query: mock.fn(),
    end: mock.fn(),
};

const originalModuleCache = new Map();

function mockModule(specifier, mockExports) {
    const resolved = import.meta.resolve(specifier);
    originalModuleCache.set(resolved, Module._cache.get(resolved));
    Module._cache.set(resolved, {
        exports: mockExports,
        loaded: true,
    });
}

function restoreModules() {
    for (const [resolved, original] of originalModuleCache) {
        if (original) {
            Module._cache.set(resolved, original);
        } else {
            Module._cache.delete(resolved);
        }
    }
    originalModuleCache.clear();
}

import { Module } from 'module';

mockModule('../src/config/DBconfig/database.js', { default: mockPool });

// Set env vars before envConfig.js is imported
process.env.ACCESS_TOKEN_SECRET  = 'test-access-secret-min-32-chars-long!!';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-min-32-chars-long!!';
process.env.PASSWORD_RESET_TOKEN_SECRET = 'test-reset-secret-min-32-chars-long!!!';

const ACCESS_TOKEN_SECRET       = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET      = process.env.REFRESH_TOKEN_SECRET;
const PASSWORD_RESET_TOKEN_SECRET = process.env.PASSWORD_RESET_TOKEN_SECRET;

let authService;
let authController;

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

before(async () => {
    const serviceMod = await import('../src/services/auth.service.js');
    authService = serviceMod;
    
    const controllerMod = await import('../src/controllers/auth.controller.js');
    authController = controllerMod;
});

after(() => {
    restoreModules();
});

beforeEach(() => {
    mockConnection.query.mock.resetCalls();
    mockConnection.beginTransaction.mock.resetCalls();
    mockConnection.commit.mock.resetCalls();
    mockConnection.rollback.mock.resetCalls();
    mockConnection.release.mock.resetCalls();
    mockPool.getConnection.mock.mockImplementation(() => mockConnection);
});

const mockReq = (body = {}, cookies = {}) => ({
    body,
    cookies,
    files: null,
});

const mockRes = () => {
    const res = {
        statusCode: 200,
        body: null,
        cookies: {},
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        },
        cookie(name, value, options) {
            this.cookies[name] = { value, options };
            return this;
        },
        clearCookie(name, options) {
            delete this.cookies[name];
            return this;
        },
    };
    return res;
};

describe('Auth Service', () => {
    describe('registerUser', () => {
        it('should register a new USER successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[]])
                .mock.mockImplementationOnce(async () => [{ insertId: 1 }]);

            const user = await authService.registerUser({
                name: 'Test User',
                phone: '9876543210',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            });

            assert.equal(user.id, 1);
            assert.equal(user.name, 'Test User');
            assert.equal(user.phone, '9876543210');
            assert.equal(user.email, 'test@example.com');
            assert.equal(user.role, 'USER');
            assert.ok(mockConnection.beginTransaction.mock.callCount() >= 1);
            assert.ok(mockConnection.commit.mock.callCount() >= 1);
        });

        it('should throw error on duplicate phone', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{ id: 1 }]]);

            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'USER',
                }),
                { message: 'Phone or Email is already registered' }
            );
            assert.ok(mockConnection.rollback.mock.callCount() >= 1);
        });

        it('should throw error on duplicate email', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{ id: 1 }]]);

            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User',
                    phone: '9876543211',
                    email: 'existing@example.com',
                    password: 'password123',
                    role: 'USER',
                }),
                { message: 'Phone or Email is already registered' }
            );
        });

        it('should throw error for invalid role', async () => {
            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'INVALID',
                }),
                { message: 'Invalid role' }
            );
        });

        it('should throw error for short password', async () => {
            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    password: 'short',
                    role: 'USER',
                }),
                { message: 'Password must be at least 8 characters' }
            );
        });

        it('should register a DRIVER with all required fields', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[]])
                .mock.mockImplementationOnce(async () => [[]])
                .mock.mockImplementationOnce(async () => [{ insertId: 1 }])
                .mock.mockImplementationOnce(async () => [{ insertId: 10 }]);

            const user = await authService.registerUser({
                name: 'Driver User',
                phone: '9876543210',
                email: 'driver@example.com',
                password: 'password123',
                role: 'DRIVER',
                city: 'Bengaluru',
                vehicleType: 'BIKE',
                vehicleModel: 'Activa',
                vehiclePlate: 'KA01AB1234',
                drivingLicense: 'DL1234567890',
            });

            assert.equal(user.id, 1);
            assert.equal(user.role, 'DRIVER');
            assert.ok(user.driver);
            assert.equal(user.driver.id, 10);
        });

        it('should throw error for missing driver fields', async () => {
            await assert.rejects(
                () => authService.registerUser({
                    name: 'Driver User',
                    phone: '9876543210',
                    email: 'driver@example.com',
                    password: 'password123',
                    role: 'DRIVER',
                }),
                { message: 'City, vehicle type, vehicle model, vehicle plate and driving license are required' }
            );
        });

        it('should throw error for duplicate vehicle plate or license', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[]])
                .mock.mockImplementationOnce(async () => [[{ id: 1 }]]);

            await assert.rejects(
                () => authService.registerUser({
                    name: 'Driver User',
                    phone: '9876543210',
                    email: 'driver@example.com',
                    password: 'password123',
                    role: 'DRIVER',
                    city: 'Bengaluru',
                    vehicleType: 'BIKE',
                    vehicleModel: 'Activa',
                    vehiclePlate: 'KA01AB1234',
                    drivingLicense: 'DL1234567890',
                }),
                { message: 'Vehicle plate or driving license is already registered' }
            );
        });
    });

    describe('loginUser', () => {
        const passwordHash = '$2b$12$hashedpassword';

        it('should login successfully with phone', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    password_hash: passwordHash,
                    role: 'USER',
                    profile_image: null,
                    is_active: 1,
                }]])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.loginUser({
                identifier: '9876543210',
                password: 'password123',
                role: 'USER',
            });

            assert.ok(result.user);
            assert.equal(result.user.id, 1);
            assert.ok(result.accessToken);
            assert.ok(result.refreshToken);
            assert.ok(mockConnection.query.mock.callCount() >= 2);
        });

        it('should login successfully with email', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    password_hash: passwordHash,
                    role: 'USER',
                    profile_image: null,
                    is_active: 1,
                }]])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.loginUser({
                identifier: 'test@example.com',
                password: 'password123',
                role: 'USER',
            });

            assert.ok(result.user);
            assert.ok(result.accessToken);
            assert.ok(result.refreshToken);
        });

        it('should throw error for invalid identifier', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            await assert.rejects(
                () => authService.loginUser({
                    identifier: 'nonexistent@example.com',
                    password: 'password123',
                    role: 'USER',
                }),
                { message: 'Invalid email/phone, password or account type' }
            );
        });

        it('should throw error for wrong password', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{
                id: 1,
                name: 'Test User',
                phone: '9876543210',
                email: 'test@example.com',
                password_hash: passwordHash,
                role: 'USER',
                profile_image: null,
                is_active: 1,
            }]]);

            await assert.rejects(
                () => authService.loginUser({
                    identifier: '9876543210',
                    password: 'wrongpassword',
                    role: 'USER',
                }),
                { message: 'Invalid email/phone, password or account type' }
            );
        });

        it('should throw error for inactive user', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{
                id: 1,
                name: 'Test User',
                phone: '9876543210',
                email: 'test@example.com',
                password_hash: passwordHash,
                role: 'USER',
                profile_image: null,
                is_active: 0,
            }]]);

            await assert.rejects(
                () => authService.loginUser({
                    identifier: '9876543210',
                    password: 'password123',
                    role: 'USER',
                }),
                { message: 'Your account is inactive' }
            );
        });

        it('should throw error for invalid role', async () => {
            await assert.rejects(
                () => authService.loginUser({
                    identifier: '9876543210',
                    password: 'password123',
                    role: 'INVALID',
                }),
                { message: 'Invalid account type' }
            );
        });
    });

    describe('refreshUserToken', () => {
        const userId = 1;
        const refreshToken = jwt.sign({ user: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const refreshTokenHash = '$2b$12$hashedrefreshtoken';

        it('should rotate refresh token successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: refreshTokenHash,
                    expires_at: new Date(Date.now() + 86400000),
                }]])
                .mock.mockImplementationOnce(async () => [[{
                    id: userId,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    role: 'USER',
                    profile_image: null,
                    is_active: 1,
                }]])
                .mock.mockImplementationOnce(async () => [])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.refreshUserToken(refreshToken);

            assert.ok(result.accessToken);
            assert.ok(result.refreshToken);
            assert.notEqual(result.refreshToken, refreshToken);
            assert.equal(result.user.id, userId);
            assert.ok(mockConnection.beginTransaction.mock.callCount() >= 1);
            assert.ok(mockConnection.commit.mock.callCount() >= 1);
        });

        it('should throw error for missing refresh token', async () => {
            await assert.rejects(
                () => authService.refreshUserToken(null),
                { message: 'Refresh token is required' }
            );
        });

        it('should throw error for invalid/expired refresh token', async () => {
            const invalidToken = jwt.sign({ user: userId }, 'wrong-secret', { expiresIn: '7d' });

            await assert.rejects(
                () => authService.refreshUserToken(invalidToken),
                { message: 'Invalid or expired refresh token' }
            );
        });

        it('should throw error when token not found in database', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            await assert.rejects(
                () => authService.refreshUserToken(refreshToken),
                { message: 'Refresh token not found or expired' }
            );
        });

        it('should throw error when token hash does not match', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{
                id: 1,
                user_id: userId,
                token_hash: '$2b$12$differenthash',
                expires_at: new Date(Date.now() + 86400000),
            }]]);

            await assert.rejects(
                () => authService.refreshUserToken(refreshToken),
                { message: 'Invalid refresh token' }
            );
        });

        it('should throw error for inactive user', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: refreshTokenHash,
                    expires_at: new Date(Date.now() + 86400000),
                }]])
                .mock.mockImplementationOnce(async () => [[{
                    id: userId,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    role: 'USER',
                    profile_image: null,
                    is_active: 0,
                }]]);

            await assert.rejects(
                () => authService.refreshUserToken(refreshToken),
                { message: 'Your account is inactive' }
            );
        });

        it('should delete old token and insert new one (rotation)', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: refreshTokenHash,
                    expires_at: new Date(Date.now() + 86400000),
                }]])
                .mock.mockImplementationOnce(async () => [[{
                    id: userId,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    role: 'USER',
                    profile_image: null,
                    is_active: 1,
                }]])
                .mock.mockImplementationOnce(async () => [])
                .mock.mockImplementationOnce(async () => []);

            await authService.refreshUserToken(refreshToken);

            const deleteCalls = mockConnection.query.mock.calls.filter(call => 
                call.arguments[0].includes('DELETE FROM refresh_tokens')
            );
            const insertCalls = mockConnection.query.mock.calls.filter(call =>
                call.arguments[0].includes('INSERT INTO refresh_tokens')
            );

            assert.equal(deleteCalls.length, 1);
            assert.equal(insertCalls.length, 1);
        });
    });

    describe('logoutUser', () => {
        const userId = 1;
        const refreshToken = jwt.sign({ user: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const refreshTokenHash = '$2b$12$hashedrefreshtoken';

        it('should delete refresh token on logout', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    token_hash: refreshTokenHash,
                }]])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.logoutUser(refreshToken);

            assert.equal(result.success, true);
            assert.ok(mockConnection.query.mock.calls.some(call =>
                call.arguments[0].includes('DELETE FROM refresh_tokens')
            ));
        });

        it('should throw error for missing refresh token', async () => {
            await assert.rejects(
                () => authService.logoutUser(null),
                { message: 'Refresh token is required' }
            );
        });

        it('should throw error for invalid token', async () => {
            const invalidToken = jwt.sign({ user: userId }, 'wrong-secret', { expiresIn: '7d' });

            await assert.rejects(
                () => authService.logoutUser(invalidToken),
                { message: 'Invalid or expired refresh token' }
            );
        });

        it('should throw error when token not found', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            await assert.rejects(
                () => authService.logoutUser(refreshToken),
                { message: 'Refresh token not found' }
            );
        });
    });

    describe('requestPasswordReset', () => {
        it('should generate reset token for existing user by email', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '9876543210',
                    role: 'USER',
                }]])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.requestPasswordReset({
                email: 'test@example.com',
                phone: null,
            });

            assert.ok(result.resetToken);
            assert.equal(result.email, 'test@example.com');
            
            const payload = jwt.verify(result.resetToken, ACCESS_TOKEN_SECRET);
            assert.equal(payload.user, 1);
            assert.equal(payload.purpose, 'password_reset');
            assert.equal(payload.role, 'USER');
        });

        it('should generate reset token for existing user by phone', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '9876543210',
                    role: 'USER',
                }]])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.requestPasswordReset({
                email: null,
                phone: '9876543210',
            });

            assert.ok(result.resetToken);
            assert.equal(result.email, 'test@example.com');
        });

        it('should throw error for non-existent user (generic message)', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            await assert.rejects(
                () => authService.requestPasswordReset({
                    email: 'nonexistent@example.com',
                    phone: null,
                }),
                { message: 'No account found with this email or phone' }
            );
        });

        it('should throw error for missing email and phone', async () => {
            await assert.rejects(
                () => authService.requestPasswordReset({
                    email: null,
                    phone: null,
                }),
                { message: 'Valid email or phone is required' }
            );
        });

        it('should use ON DUPLICATE KEY UPDATE for token storage', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '9876543210',
                    role: 'USER',
                }]])
                .mock.mockImplementationOnce(async () => []);

            await authService.requestPasswordReset({
                email: 'test@example.com',
                phone: null,
            });

            const insertCall = mockConnection.query.mock.calls.find(call =>
                call.arguments[0].includes('INSERT INTO password_reset_tokens')
            );
            assert.ok(insertCall);
            assert.ok(insertCall.arguments[0].includes('ON DUPLICATE KEY UPDATE'));
        });
    });

    describe('resetUserPassword', () => {
        const userId = 1;
        const resetToken = jwt.sign(
            { user: userId, purpose: 'password_reset', role: 'USER' },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        );
        const tokenHash = '$2b$12$hashedresettoken';

        it('should reset password successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: tokenHash,
                    expires_at: new Date(Date.now() + 1800000),
                }]])
                .mock.mockImplementationOnce(async () => [])
                .mock.mockImplementationOnce(async () => []);

            const result = await authService.resetUserPassword({
                token: resetToken,
                newPassword: 'newpassword123',
            });

            assert.equal(result.success, true);
            assert.ok(mockConnection.query.mock.calls.some(call =>
                call.arguments[0].includes('UPDATE users SET password_hash')
            ));
            assert.ok(mockConnection.query.mock.calls.some(call =>
                call.arguments[0].includes('DELETE FROM password_reset_tokens')
            ));
        });

        it('should throw error for missing token', async () => {
            await assert.rejects(
                () => authService.resetUserPassword({
                    token: '',
                    newPassword: 'newpassword123',
                }),
                { message: 'Valid reset token and a password with at least 8 characters are required' }
            );
        });

        it('should throw error for short password', async () => {
            await assert.rejects(
                () => authService.resetUserPassword({
                    token: resetToken,
                    newPassword: 'short',
                }),
                { message: 'Valid reset token and a password with at least 8 characters are required' }
            );
        });

        it('should throw error for invalid token signature', async () => {
            const invalidToken = jwt.sign(
                { user: userId, purpose: 'password_reset', role: 'USER' },
                'wrong-secret',
                { expiresIn: '30m' }
            );

            await assert.rejects(
                () => authService.resetUserPassword({
                    token: invalidToken,
                    newPassword: 'newpassword123',
                }),
                { message: 'Invalid or expired reset token' }
            );
        });

        it('should throw error for expired token', async () => {
            const expiredToken = jwt.sign(
                { user: userId, purpose: 'password_reset', role: 'USER' },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '-1m' }
            );

            await assert.rejects(
                () => authService.resetUserPassword({
                    token: expiredToken,
                    newPassword: 'newpassword123',
                }),
                { message: 'Invalid or expired reset token' }
            );
        });

        it('should throw error for wrong purpose', async () => {
            const wrongPurposeToken = jwt.sign(
                { user: userId, purpose: 'email_verification', role: 'USER' },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );

            await assert.rejects(
                () => authService.resetUserPassword({
                    token: wrongPurposeToken,
                    newPassword: 'newpassword123',
                }),
                { message: 'Invalid reset token' }
            );
        });

        it('should throw error when token not found in database', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            await assert.rejects(
                () => authService.resetUserPassword({
                    token: resetToken,
                    newPassword: 'newpassword123',
                }),
                { message: 'Reset token not found or expired' }
            );
        });

        it('should throw error when token hash does not match', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{
                id: 1,
                user_id: userId,
                token_hash: '$2b$12$differenthash',
                expires_at: new Date(Date.now() + 1800000),
            }]]);

            await assert.rejects(
                () => authService.resetUserPassword({
                    token: resetToken,
                    newPassword: 'newpassword123',
                }),
                { message: 'Reset token not found or expired' }
            );
        });

        it('should revoke (delete) reset token after successful use', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: tokenHash,
                    expires_at: new Date(Date.now() + 1800000),
                }]])
                .mock.mockImplementationOnce(async () => [])
                .mock.mockImplementationOnce(async () => []);

            await authService.resetUserPassword({
                token: resetToken,
                newPassword: 'newpassword123',
            });

            const deleteCalls = mockConnection.query.mock.calls.filter(call =>
                call.arguments[0].includes('DELETE FROM password_reset_tokens')
            );
            assert.equal(deleteCalls.length, 1);
            assert.ok(deleteCalls[0].arguments[1].includes(1));
        });
    });
});

describe('Auth Controller', () => {
    describe('Authcontroller (Register)', () => {
        it('should return 400 for missing required fields', async () => {
            const req = mockReq({ name: 'Test' });
            const res = mockRes();

            await authController.Authcontroller(req, res);

            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
            assert.ok(res.body.message.includes('required'));
        });

        it('should return 400 for invalid role', async () => {
            const req = mockReq({
                name: 'Test User',
                phone: '9876543210',
                email: 'test@example.com',
                password: 'password123',
                role: 'INVALID',
            });
            const res = mockRes();

            await authController.Authcontroller(req, res);

            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
            assert.equal(res.body.message, 'Invalid role');
        });

        it('should register user successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[]])
                .mock.mockImplementationOnce(async () => [{ insertId: 1 }])
                .mock.mockImplementationOnce(async () => []);

            const req = mockReq({
                name: 'Test User',
                phone: '9876543210',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            });
            const res = mockRes();

            await authController.Authcontroller(req, res);

            assert.equal(res.statusCode, 201);
            assert.equal(res.body.success, true);
            assert.ok(res.body.user);
            assert.ok(res.body.accessToken);
            assert.ok(res.body.refreshToken);
            assert.ok(res.cookies.accessToken);
            assert.ok(res.cookies.refreshToken);
        });

        it('should return 500 for duplicate registration', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[{ id: 1 }]]);

            const req = mockReq({
                name: 'Test User',
                phone: '9876543210',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            });
            const res = mockRes();

            await authController.Authcontroller(req, res);

            assert.equal(res.statusCode, 500);
            assert.equal(res.body.success, false);
            assert.ok(res.body.message.includes('Registration failed'));
        });
    });

    describe('login', () => {
        let passwordHash;

        before(async () => {
            passwordHash = await bcrypt.hash('password123', 12);
        });

        it('should return 400 for missing fields', async () => {
            const req = mockReq({ identifier: '9876543210' });
            const res = mockRes();

            await authController.login(req, res);

            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
            assert.ok(res.body.message.includes('required'));
        });

        it('should return 401 for invalid credentials', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            const req = mockReq({
                identifier: '9876543210',
                password: 'wrongpassword',
                role: 'USER',
            });
            const res = mockRes();

            await authController.login(req, res);

            assert.equal(res.statusCode, 401);
            assert.equal(res.body.success, false);
            assert.ok(res.body.message.includes('Login failed'));
        });

        it('should login successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    password_hash: passwordHash,
                    role: 'USER',
                    profile_image: null,
                    is_active: 1,
                }]])
                .mock.mockImplementationOnce(async () => []);

            const req = mockReq({
                identifier: '9876543210',
                password: 'password123',
                role: 'USER',
            });
            const res = mockRes();

            await authController.login(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.ok(res.body.user);
            assert.ok(res.body.accessToken);
            assert.ok(res.body.refreshToken);
            assert.ok(res.cookies.accessToken);
            assert.ok(res.cookies.refreshToken);
        });
    });

    describe('refreshToken', () => {
        const userId = 1;
        let refreshToken;
        let refreshTokenHash;

        before(async () => {
            refreshToken = jwt.sign({ user: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        });

        it('should return 401 for missing refresh token', async () => {
            const req = mockReq({}, {});
            const res = mockRes();

            await authController.refreshToken(req, res);

            assert.equal(res.statusCode, 401);
            assert.equal(res.body.success, false);
            assert.equal(res.body.message, 'Refresh token is required');
        });

        it('should return 401 for invalid refresh token', async () => {
            const req = mockReq({}, { refreshToken: 'invalid.token.here' });
            const res = mockRes();

            await authController.refreshToken(req, res);

            assert.equal(res.statusCode, 401);
            assert.equal(res.body.success, false);
        });

        it('should rotate tokens successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: refreshTokenHash,
                    expires_at: new Date(Date.now() + 86400000),
                }]])
                .mock.mockImplementationOnce(async () => [[{
                    id: userId,
                    name: 'Test User',
                    phone: '9876543210',
                    email: 'test@example.com',
                    role: 'USER',
                    profile_image: null,
                    is_active: 1,
                }]])
                .mock.mockImplementationOnce(async () => [])
                .mock.mockImplementationOnce(async () => []);

            const req = mockReq({}, { refreshToken });
            const res = mockRes();

            await authController.refreshToken(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.ok(res.body.accessToken);
            assert.ok(res.body.refreshToken);
            assert.notEqual(res.body.refreshToken, refreshToken);
        });
    });

    describe('logout', () => {
        const userId = 1;
        let refreshToken;
        let refreshTokenHash;

        before(async () => {
            refreshToken = jwt.sign({ user: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        });

        it('should logout successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    token_hash: refreshTokenHash,
                }]])
                .mock.mockImplementationOnce(async () => []);

            const req = mockReq({}, { refreshToken });
            const res = mockRes();

            await authController.logout(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.message, 'Logout successful');
            assert.ok(!res.cookies.accessToken);
            assert.ok(!res.cookies.refreshToken);
        });

        it('should clear cookies even if token invalid', async () => {
            const req = mockReq({}, { refreshToken: 'invalid' });
            const res = mockRes();

            await authController.logout(req, res);

            assert.equal(res.statusCode, 200);
            assert.ok(!res.cookies.accessToken);
            assert.ok(!res.cookies.refreshToken);
        });
    });

    describe('forgotPassword', () => {
        it('should return 400 for missing email and phone', async () => {
            const req = mockReq({});
            const res = mockRes();

            await authController.forgotPassword(req, res);

            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
            assert.equal(res.body.message, 'Email or phone is required');
        });

        it('should return generic message for non-existent user', async () => {
            mockConnection.query.mock.mockImplementationOnce(async () => [[]]);

            const req = mockReq({ email: 'nonexistent@example.com' });
            const res = mockRes();

            await authController.forgotPassword(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.ok(res.body.message.includes('If an account exists'));
        });

        it('should return reset token in development', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '9876543210',
                    role: 'USER',
                }]])
                .mock.mockImplementationOnce(async () => []);

            const req = mockReq({ email: 'test@example.com' });
            const res = mockRes();

            await authController.forgotPassword(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.ok(res.body.resetToken);
        });
    });

    describe('resetPassword', () => {
        const userId = 1;
        let resetToken;
        let tokenHash;

        before(async () => {
            resetToken = jwt.sign(
                { user: userId, purpose: 'password_reset', role: 'USER' },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
            tokenHash = await bcrypt.hash(resetToken, 12);
        });

        it('should return 400 for missing token or password', async () => {
            const req = mockReq({ token: resetToken });
            const res = mockRes();

            await authController.resetPassword(req, res);

            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
            assert.ok(res.body.message.includes('required'));
        });

        it('should reset password successfully', async () => {
            mockConnection.query
                .mock.mockImplementationOnce(async () => [[{
                    id: 1,
                    user_id: userId,
                    token_hash: tokenHash,
                    expires_at: new Date(Date.now() + 1800000),
                }]])
                .mock.mockImplementationOnce(async () => [])
                .mock.mockImplementationOnce(async () => []);

            const req = mockReq({ token: resetToken, password: 'newpassword123' });
            const res = mockRes();

            await authController.resetPassword(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.message, 'Password reset successfully');
        });

        it('should return 400 for invalid token', async () => {
            const req = mockReq({ token: 'invalid.token.here', password: 'newpassword123' });
            const res = mockRes();

            await authController.resetPassword(req, res);

            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
        });
    });
});