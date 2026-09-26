import { describe, it, before, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret-min-32-chars-long!!';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-min-32-chars-long!!';
process.env.PASSWORD_RESET_TOKEN_SECRET = 'test-reset-token-secret-min-32-chars-long!!';

// Module-level aliases so tests can sign/verify with the same secrets the
// production token.js reads from envConfig (which loads these env vars).
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const PASSWORD_RESET_TOKEN_SECRET = process.env.PASSWORD_RESET_TOKEN_SECRET;

const mockConnection = {
    query: mock.fn(async () => [[]]),
    beginTransaction: mock.fn(async () => {}),
    commit: mock.fn(async () => {}),
    rollback: mock.fn(async () => {}),
    release: mock.fn(async () => {}),
};

const queuedQueryResponses = [];

const queueQueryResponse = (implementation) => {
    queuedQueryResponses.push(implementation);
};

const mockPool = {
    getConnection: mock.fn(async () => mockConnection),
    query: mock.fn(async () => [[]]),
};

await mock.module('../src/config/DBconfig/database.js', {
    exports: {
        default: mockPool,
    },
});

const authService = await import('../src/services/auth.service.js');
const authController = await import('../src/controllers/auth.controller.js');

beforeEach(() => {
    mockConnection.query.mock.resetCalls();
    queuedQueryResponses.length = 0;
    mockConnection.query.mock.mockImplementation(async (...args) => {
        const implementation = queuedQueryResponses.shift();
        return implementation ? implementation(...args) : [[]];
    });

    mockConnection.beginTransaction.mock.resetCalls();
    mockConnection.beginTransaction.mock.mockImplementation(async () => {});

    mockConnection.commit.mock.resetCalls();
    mockConnection.commit.mock.mockImplementation(async () => {});

    mockConnection.rollback.mock.resetCalls();
    mockConnection.rollback.mock.mockImplementation(async () => {});

    mockConnection.release.mock.resetCalls();
    mockConnection.release.mock.mockImplementation(async () => {});

    mockPool.getConnection.mock.resetCalls();
    mockPool.getConnection.mock.mockImplementation(async () => mockConnection);

    mockPool.query.mock.resetCalls();
    mockPool.query.mock.mockImplementation(async () => [[]]);
});

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const mockReq = (body = {}, cookies = {}) => ({ body, cookies, files: null });

const mockRes = () => {
    const res = {
        statusCode: 200,
        body:       null,
        cookies:    {},
        status(code)        { this.statusCode = code; return this; },
        json(data)          { this.body = data; return this; },
        cookie(name, value) { this.cookies[name] = { value }; return this; },
        clearCookie(name)   { delete this.cookies[name]; return this; },
    };
    return res;
};

// ---------------------------------------------------------------
// AUTH SERVICE TESTS
// ---------------------------------------------------------------
describe('Auth Service', { concurrency: false }, () => {

    describe('registerUser', { concurrency: false }, () => {
        it('registers a new USER successfully', async () => {
            queueQueryResponse(async () => [[]])              // duplicate check;
                queueQueryResponse(async () => [{ insertId: 1 }]); // INSERT user

            const user = await authService.registerUser({
                name: 'Test User', phone: '9876543210',
                email: 'test@example.com', password: 'password123', role: 'USER',
            });

            assert.equal(user.id, 1);
            assert.equal(user.name, 'Test User');
            assert.equal(user.phone, '9876543210');
            assert.equal(user.email, 'test@example.com');
            assert.equal(user.role, 'USER');
            assert.ok(mockConnection.beginTransaction.mock.callCount() >= 1);
            assert.ok(mockConnection.commit.mock.callCount() >= 1);
        });

        it('throws on duplicate phone/email', async () => {
            queueQueryResponse(async () => [[{ id: 1 }]]);

            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User', phone: '9876543210',
                    email: 'test@example.com', password: 'password123', role: 'USER',
                }),
                { message: 'Phone or Email is already registered' }
            );
            assert.ok(mockConnection.rollback.mock.callCount() >= 1);
        });

        it('throws for invalid role', async () => {
            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User', phone: '9876543210',
                    email: 'test@example.com', password: 'password123', role: 'INVALID',
                }),
                { message: 'Invalid role' }
            );
        });

        it('throws for short password', async () => {
            await assert.rejects(
                () => authService.registerUser({
                    name: 'Test User', phone: '9876543210',
                    email: 'test@example.com', password: 'short', role: 'USER',
                }),
                { message: 'Password must be at least 8 characters' }
            );
        });

        it('registers a DRIVER with required fields', async () => {
            queueQueryResponse(async () => [[]])              // user dup check;
                queueQueryResponse(async () => [[]])              // driver dup check;
                queueQueryResponse(async () => [{ insertId: 1 }]) // INSERT user;
                queueQueryResponse(async () => [{ insertId: 10 }]); // INSERT driver

            const user = await authService.registerUser({
                name: 'Driver User', phone: '9876543210',
                email: 'driver@example.com', password: 'password123', role: 'DRIVER',
                city: 'Bengaluru', vehicleType: 'BIKE', vehicleModel: 'Activa',
                vehiclePlate: 'KA01AB1234', drivingLicense: 'DL1234567890',
            });

            assert.equal(user.id, 1);
            assert.equal(user.role, 'DRIVER');
            assert.ok(user.driver);
            assert.equal(user.driver.id, 10);
        });

        it('throws for missing driver fields', async () => {
            await assert.rejects(
                () => authService.registerUser({
                    name: 'Driver User', phone: '9876543210',
                    email: 'driver@example.com', password: 'password123', role: 'DRIVER',
                }),
                { message: 'City, vehicle type, vehicle model, vehicle plate and driving license are required' }
            );
        });

        it('throws for duplicate vehicle plate or license', async () => {
            queueQueryResponse(async () => [[]])           // user dup check;
                queueQueryResponse(async () => [[{ id: 1 }]]); // driver dup check

            await assert.rejects(
                () => authService.registerUser({
                    name: 'Driver User', phone: '9876543210',
                    email: 'driver@example.com', password: 'password123', role: 'DRIVER',
                    city: 'Bengaluru', vehicleType: 'BIKE', vehicleModel: 'Activa',
                    vehiclePlate: 'KA01AB1234', drivingLicense: 'DL1234567890',
                }),
                { message: 'Vehicle plate or driving license is already registered' }
            );
        });
    });

    describe('loginUser', { concurrency: false }, () => {
        const passwordHash = '$2b$04$iIT1tSuohEgPESDTDJKaY.2wrRlIMAUl5zDftay0doOAPAgv/8YLO';

        it('logs in successfully with phone', async () => {
            queueQueryResponse(async () => [[{
                    id: 1, name: 'Test User', phone: '9876543210',
                    email: 'test@example.com', password_hash: passwordHash,
                    role: 'USER', profile_image: null, is_active: 1,
                }]]);
                queueQueryResponse(async () => []); // INSERT refresh token

            const result = await authService.loginUser({ identifier: '9876543210', password: 'password123', role: 'USER' });

            assert.ok(result.user);
            assert.equal(result.user.id, 1);
            assert.ok(result.accessToken);
            assert.ok(result.refreshToken);
        });

        it('logs in successfully with email', async () => {
            queueQueryResponse(async () => [[{
                    id: 1, name: 'Test User', phone: '9876543210',
                    email: 'test@example.com', password_hash: passwordHash,
                    role: 'USER', profile_image: null, is_active: 1,
                }]]);
                queueQueryResponse(async () => []);

            const result = await authService.loginUser({ identifier: 'test@example.com', password: 'password123', role: 'USER' });
            assert.ok(result.user);
            assert.ok(result.accessToken);
            assert.ok(result.refreshToken);
        });

        it('throws for non-existent account', async () => {
            queueQueryResponse(async () => [[]]);

            await assert.rejects(
                () => authService.loginUser({ identifier: 'nonexistent@example.com', password: 'password123', role: 'USER' }),
                { message: 'Invalid credentials' }
            );
        });

        it('throws for wrong password', async () => {
            queueQueryResponse(async () => [[{
                id: 1, password_hash: passwordHash, role: 'USER', is_active: 1,
            }]]);

            await assert.rejects(
                () => authService.loginUser({ identifier: '9876543210', password: 'wrongpassword', role: 'USER' }),
                { message: 'Invalid credentials' }
            );
        });

        it('throws for inactive user', async () => {
            queueQueryResponse(async () => [[{
                id: 1, password_hash: passwordHash, role: 'USER', is_active: 0,
            }]]);

            await assert.rejects(
                () => authService.loginUser({ identifier: '9876543210', password: 'password123', role: 'USER' }),
                { message: 'Your account is inactive' }
            );
        });

        it('throws for invalid role', async () => {
            await assert.rejects(
                () => authService.loginUser({ identifier: '9876543210', password: 'password123', role: 'INVALID' }),
                { message: 'Invalid account type' }
            );
        });
    });

    describe('refreshUserToken', { concurrency: false }, () => {
        const userId       = 1;
        const refreshToken = jwt.sign({ sub: String(userId), role: 'USER' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const rtHash       = bcrypt.hashSync(refreshToken, 4);

        it('rotates refresh token successfully', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: rtHash, expires_at: new Date(Date.now() + 86400000) }]]);
                queueQueryResponse(async () => [[{ id: userId, name: 'Test User', phone: '9876543210', email: 'test@example.com', role: 'USER', profile_image: null, is_active: 1 }]]);
                queueQueryResponse(async () => []) // DELETE old token;
                queueQueryResponse(async () => []); // INSERT new token

            const result = await authService.refreshUserToken(refreshToken);

            assert.ok(result.accessToken);
            assert.ok(result.refreshToken);
            assert.notEqual(result.refreshToken, refreshToken);
            assert.equal(result.user.id, userId);
            assert.ok(mockConnection.beginTransaction.mock.callCount() >= 1);
            assert.ok(mockConnection.commit.mock.callCount() >= 1);
        });

        it('throws for missing refresh token', async () => {
            await assert.rejects(() => authService.refreshUserToken(null), { message: 'Refresh token is required' });
        });

        it('throws for invalid/expired refresh token', async () => {
            const bad = jwt.sign({ user: userId }, 'wrong-secret', { expiresIn: '7d' });
            await assert.rejects(() => authService.refreshUserToken(bad), { message: 'Invalid or expired refresh token' });
        });

        it('throws when token not in database', async () => {
            // Returns empty list → no matching token
            queueQueryResponse(async () => [[
                { id: 9, user_id: userId, token_hash: '$2b$12$nomatch', expires_at: new Date(Date.now() + 86400000) }
            ]]);
            await assert.rejects(() => authService.refreshUserToken(refreshToken), { message: 'Token reuse detected. All sessions revoked.' });
        });

        it('throws when token hash does not match', async () => {
            queueQueryResponse(async () => [[
                { id: 1, user_id: userId, token_hash: '$2b$12$differenthash', expires_at: new Date(Date.now() + 86400000) }
            ]]);
            await assert.rejects(() => authService.refreshUserToken(refreshToken), { message: 'Token reuse detected. All sessions revoked.' });
        });

        it('throws for inactive user', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: rtHash, expires_at: new Date(Date.now() + 86400000) }]]);
                queueQueryResponse(async () => [[{ id: userId, role: 'USER', is_active: 0 }]]);

            await assert.rejects(() => authService.refreshUserToken(refreshToken), { message: 'Your account is inactive' });
        });

        it('deletes old token and inserts new one (rotation)', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: rtHash, expires_at: new Date(Date.now() + 86400000) }]]);
                queueQueryResponse(async () => [[{ id: userId, name: 'Test User', phone: '9876543210', email: 'test@example.com', role: 'USER', profile_image: null, is_active: 1 }]]);
                queueQueryResponse(async () => []);
                queueQueryResponse(async () => []);

            await authService.refreshUserToken(refreshToken);

            const delCalls = mockConnection.query.mock.calls.filter(c => c.arguments[0].includes('DELETE FROM refresh_tokens'));
            const insCalls = mockConnection.query.mock.calls.filter(c => c.arguments[0].includes('INSERT INTO refresh_tokens'));
            assert.equal(delCalls.length, 1);
            assert.equal(insCalls.length, 1);
        });
    });

    describe('logoutUser', { concurrency: false }, () => {
        const userId       = 1;
        const refreshToken = jwt.sign({ sub: String(userId), role: 'USER' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const rtHash       = bcrypt.hashSync(refreshToken, 4);

        it('deletes refresh token on logout', async () => {
            queueQueryResponse(async () => [[{ id: 1, token_hash: rtHash }]]);
                queueQueryResponse(async () => []);

            const result = await authService.logoutUser(refreshToken);

            assert.equal(result.success, true);
            assert.ok(mockConnection.query.mock.calls.some(c => c.arguments[0].includes('DELETE FROM refresh_tokens')));
        });

        it('throws for missing token', async () => {
            await assert.rejects(() => authService.logoutUser(null), { message: 'Refresh token is required' });
        });

        it('throws for invalid token', async () => {
            const bad = jwt.sign({ user: userId }, 'wrong-secret', { expiresIn: '7d' });
            await assert.rejects(() => authService.logoutUser(bad), { message: 'Invalid or expired refresh token' });
        });

        it('throws when token not found', async () => {
            // Token in DB but hash won't match → 'Invalid refresh token'
            queueQueryResponse(async () => [[
                { id: 9, token_hash: '$2b$12$nomatch' }
            ]]);
            await assert.rejects(() => authService.logoutUser(refreshToken), { message: 'Refresh token not found' });
        });
    });

    describe('requestPasswordReset', { concurrency: false }, () => {
        it('returns { sent: true, resetToken } for existing user by email', async () => {
            queueQueryResponse(async () => [[{ id: 1, name: 'Test User', email: 'test@example.com', phone: '9876543210', role: 'USER' }]]);
                queueQueryResponse(async () => []);

            const result = await authService.requestPasswordReset({ email: 'test@example.com', phone: null });

            assert.equal(result.sent, true);
            assert.ok(result.resetToken);
            const payload = jwt.verify(result.resetToken, PASSWORD_RESET_TOKEN_SECRET);
            assert.equal(payload.purpose, 'password_reset');
        });

        it('returns { sent: true, resetToken } for existing user by phone', async () => {
            queueQueryResponse(async () => [[{ id: 1, name: 'Test User', email: 'test@example.com', phone: '9876543210', role: 'USER' }]]);
                queueQueryResponse(async () => []);

            const result = await authService.requestPasswordReset({ email: null, phone: '9876543210' });
            assert.equal(result.sent, true);
            assert.ok(result.resetToken);
        });

        it('returns { sent: false } silently for non-existent user (no enumeration)', async () => {
            queueQueryResponse(async () => [[]]);

            const result = await authService.requestPasswordReset({ email: 'nonexistent@example.com', phone: null });
            assert.equal(result.sent, false);
        });

        it('throws for missing email and phone', async () => {
            await assert.rejects(
                () => authService.requestPasswordReset({ email: null, phone: null }),
                { message: 'Valid email or phone is required' }
            );
        });

        it('uses ON DUPLICATE KEY UPDATE for token storage', async () => {
            queueQueryResponse(async () => [[{ id: 1, name: 'Test User', email: 'test@example.com', phone: '9876543210', role: 'USER' }]]);
                queueQueryResponse(async () => []);

            await authService.requestPasswordReset({ email: 'test@example.com', phone: null });

            const insertCall = mockConnection.query.mock.calls.find(c => c.arguments[0].includes('INSERT INTO password_reset_tokens'));
            assert.ok(insertCall);
            assert.ok(insertCall.arguments[0].includes('ON DUPLICATE KEY UPDATE'));
        });
    });

    describe('resetUserPassword', { concurrency: false }, () => {
        const userId = 1;
        // Sign with PASSWORD_RESET_TOKEN_SECRET using the same claims as production token.js
        const resetToken = jwt.sign(
            { sub: String(userId), role: 'USER', purpose: 'password_reset', iat: Math.floor(Date.now() / 1000) },
            PASSWORD_RESET_TOKEN_SECRET,
            { expiresIn: '30m', algorithm: 'HS256' }
        );
        const tokenHash = bcrypt.hashSync(resetToken, 4);

        it('resets password and revokes refresh tokens', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: tokenHash, expires_at: new Date(Date.now() + 1800000) }]]);
                queueQueryResponse(async () => [])  // UPDATE users;
                queueQueryResponse(async () => [])  // DELETE password_reset_tokens;
                queueQueryResponse(async () => []); // DELETE refresh_tokens

            const result = await authService.resetUserPassword({ token: resetToken, newPassword: 'newpassword123' });

            assert.equal(result.success, true);
            assert.ok(mockConnection.query.mock.calls.some(c => c.arguments[0].includes('UPDATE users')));
            assert.ok(mockConnection.query.mock.calls.some(c => c.arguments[0].includes('DELETE FROM password_reset_tokens')));
            assert.ok(mockConnection.query.mock.calls.some(c => c.arguments[0].includes('DELETE FROM refresh_tokens')));
        });

        it('throws for missing token', async () => {
            await assert.rejects(
                () => authService.resetUserPassword({ token: '', newPassword: 'newpassword123' }),
                { message: 'Valid reset token and a password with at least 8 characters are required' }
            );
        });

        it('throws for short password', async () => {
            await assert.rejects(
                () => authService.resetUserPassword({ token: resetToken, newPassword: 'short' }),
                { message: 'Valid reset token and a password with at least 8 characters are required' }
            );
        });

        it('throws for invalid token signature', async () => {
            const bad = jwt.sign({ sub: String(userId), purpose: 'password_reset' }, 'wrong-secret', { expiresIn: '30m' });
            await assert.rejects(
                () => authService.resetUserPassword({ token: bad, newPassword: 'newpassword123' }),
                { message: 'Invalid or expired reset token' }
            );
        });

        it('throws for expired token', async () => {
            const expired = jwt.sign({ sub: String(userId), purpose: 'password_reset' }, PASSWORD_RESET_TOKEN_SECRET, { expiresIn: '-1m' });
            await assert.rejects(
                () => authService.resetUserPassword({ token: expired, newPassword: 'newpassword123' }),
                { message: 'Invalid or expired reset token' }
            );
        });

        it('throws for wrong purpose', async () => {
            const wrong = jwt.sign({ sub: String(userId), purpose: 'email_verification' }, PASSWORD_RESET_TOKEN_SECRET, { expiresIn: '30m' });
            await assert.rejects(
                () => authService.resetUserPassword({ token: wrong, newPassword: 'newpassword123' }),
                { message: 'Invalid reset token' }
            );
        });

        it('throws when hash does not match', async () => {
            queueQueryResponse(async () => [[
                { id: 1, user_id: userId, token_hash: '$2b$12$differenthash', expires_at: new Date(Date.now() + 1800000) }
            ]]);
            await assert.rejects(
                () => authService.resetUserPassword({ token: resetToken, newPassword: 'newpassword123' }),
                { message: 'Reset token not found or expired' }
            );
        });

        it('deletes reset token after use (single-use)', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: tokenHash, expires_at: new Date(Date.now() + 1800000) }]]);
                queueQueryResponse(async () => []);
                queueQueryResponse(async () => []);
                queueQueryResponse(async () => []);

            await authService.resetUserPassword({ token: resetToken, newPassword: 'newpassword123' });

            const delCalls = mockConnection.query.mock.calls.filter(c => c.arguments[0].includes('DELETE FROM password_reset_tokens'));
            assert.equal(delCalls.length, 1);
        });
    });
});

// ---------------------------------------------------------------
// AUTH CONTROLLER TESTS
// ---------------------------------------------------------------
describe('Auth Controller', { concurrency: false }, () => {

    describe('Authcontroller (Register)', { concurrency: false }, () => {
        it('returns 400 for missing fields', async () => {
            const req = mockReq({ name: 'Test' });
            const res = mockRes();
            await authController.Authcontroller(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
            assert.ok(res.body.message.includes('required'));
        });

        it('returns 400 for invalid role', async () => {
            const req = mockReq({ name: 'Test', phone: '9876543210', email: 'a@b.com', password: 'pass1234', role: 'INVALID' });
            const res = mockRes();
            await authController.Authcontroller(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.body.message, 'Invalid role');
        });

        it('registers user successfully', async () => {
            queueQueryResponse(async () => [[]]);
                queueQueryResponse(async () => [{ insertId: 1 }]);
                queueQueryResponse(async () => []);

            const req = mockReq({ name: 'Test User', phone: '9876543210', email: 'test@example.com', password: 'password123', role: 'USER' });
            const res = mockRes();
            await authController.Authcontroller(req, res);

            assert.equal(res.statusCode, 201);
            assert.equal(res.body.success, true);
            assert.ok(res.body.user);
            assert.ok(res.cookies.accessToken);
            assert.ok(res.cookies.refreshToken);
        });

        it('returns 500 for duplicate registration', async () => {
            queueQueryResponse(async () => [[{ id: 1 }]]);

            const req = mockReq({ name: 'Test User', phone: '9876543210', email: 'test@example.com', password: 'password123', role: 'USER' });
            const res = mockRes();
            await authController.Authcontroller(req, res);
            assert.equal(res.statusCode, 500);
            assert.equal(res.body.success, false);
        });
    });

    describe('login', { concurrency: false }, () => {
        let passwordHash;
        before(async () => { passwordHash = await bcrypt.hash('password123', 12); });

        it('returns 400 for missing fields', async () => {
            const req = mockReq({ identifier: '9876543210' });
            const res = mockRes();
            await authController.login(req, res);
            assert.equal(res.statusCode, 400);
            assert.ok(res.body.message.includes('required'));
        });

        it('returns 401 for invalid credentials', async () => {
            queueQueryResponse(async () => [[]]);

            const req = mockReq({ identifier: '9876543210', password: 'wrongpassword', role: 'USER' });
            const res = mockRes();
            await authController.login(req, res);
            assert.equal(res.statusCode, 401);
            assert.equal(res.body.success, false);
        });

        it('logs in successfully', async () => {
            queueQueryResponse(async () => [[{
                    id: 1, name: 'Test User', phone: '9876543210',
                    email: 'test@example.com', password_hash: passwordHash,
                    role: 'USER', profile_image: null, is_active: 1,
                }]]);
                queueQueryResponse(async () => []);

            const req = mockReq({ identifier: '9876543210', password: 'password123', role: 'USER' });
            const res = mockRes();
            await authController.login(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.ok(res.body.user);
            assert.ok(res.cookies.accessToken);
            assert.ok(res.cookies.refreshToken);
            assert.ok(res.cookies.accessToken);
            assert.ok(res.cookies.refreshToken);
        });
    });

    describe('refreshToken', { concurrency: false }, () => {
        const userId = 1;
        let refreshToken, refreshTokenHash;
        before(async () => {
            refreshToken     = jwt.sign({ sub: String(userId), role: 'USER' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        });

        it('returns 401 for missing token', async () => {
            const req = mockReq({}, {});
            const res = mockRes();
            await authController.refreshToken(req, res);
            assert.equal(res.statusCode, 401);
            assert.equal(res.body.message, 'Refresh token is required');
        });

        it('returns 401 for invalid token', async () => {
            const req = mockReq({}, { refreshToken: 'invalid.token.here' });
            const res = mockRes();
            await authController.refreshToken(req, res);
            assert.equal(res.statusCode, 401);
        });

        it('rotates tokens successfully', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: refreshTokenHash, expires_at: new Date(Date.now() + 86400000) }]]);
                queueQueryResponse(async () => [[{ id: userId, name: 'Test User', phone: '9876543210', email: 'test@example.com', role: 'USER', profile_image: null, is_active: 1 }]]);
                queueQueryResponse(async () => []);
                queueQueryResponse(async () => []);

            const req = mockReq({}, { refreshToken });
            const res = mockRes();
            await authController.refreshToken(req, res);

            assert.equal(res.statusCode, 200);
            assert.ok(res.cookies.accessToken);
            assert.ok(res.cookies.refreshToken);
            assert.notEqual(res.body.refreshToken, refreshToken);
        });
    });

    describe('logout', { concurrency: false }, () => {
        const userId = 1;
        let refreshToken, refreshTokenHash;
        before(async () => {
            refreshToken     = jwt.sign({ sub: String(userId), role: 'USER' }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        });

        it('logs out successfully via cookie', async () => {
            queueQueryResponse(async () => [[{ id: 1, token_hash: refreshTokenHash }]]);
                queueQueryResponse(async () => []);

            const req = mockReq({}, { refreshToken });
            const res = mockRes();
            await authController.logout(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.message, 'Logout successful');
        });

        it('logs out successfully via body (mobile)', async () => {
            queueQueryResponse(async () => [[{ id: 1, token_hash: refreshTokenHash }]]);
                queueQueryResponse(async () => []);

            const req = mockReq({ refreshToken }, {});
            const res = mockRes();
            await authController.logout(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
        });

        it('returns 200 and clears cookies even if no token provided', async () => {
            const req = mockReq({}, {});
            const res = mockRes();
            await authController.logout(req, res);
            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
        });
    });

    describe('forgotPassword', { concurrency: false }, () => {
        it('returns 400 for missing email and phone', async () => {
            const req = mockReq({});
            const res = mockRes();
            await authController.forgotPassword(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.body.message, 'Email or phone is required');
        });

        it('returns generic 200 for non-existent user (no enumeration)', async () => {
            queueQueryResponse(async () => [[]]);

            const req = mockReq({ email: 'nonexistent@example.com' });
            const res = mockRes();
            await authController.forgotPassword(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.ok(res.body.message.includes('If an account exists'));
            assert.equal(res.body.resetToken, undefined); // must not leak token for non-existent account
        });

        it('returns resetToken in development', async () => {
            queueQueryResponse(async () => [[{ id: 1, name: 'Test User', email: 'test@example.com', phone: '9876543210', role: 'USER' }]]);
                queueQueryResponse(async () => []);

            const req = mockReq({ email: 'test@example.com' });
            const res = mockRes();
            await authController.forgotPassword(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.resetToken, undefined);
        });
    });

    describe('resetPassword', { concurrency: false }, () => {
        const userId = 1;
        let resetToken, tokenHash;
        before(async () => {
            resetToken = jwt.sign(
                { sub: String(userId), role: 'USER', purpose: 'password_reset', iat: Math.floor(Date.now() / 1000) },
                PASSWORD_RESET_TOKEN_SECRET,
                { expiresIn: '30m', algorithm: 'HS256' }
            );
            tokenHash = await bcrypt.hash(resetToken, 12);
        });

        it('returns 400 for missing password', async () => {
            const req = mockReq({ token: resetToken });
            const res = mockRes();
            await authController.resetPassword(req, res);
            assert.equal(res.statusCode, 400);
            assert.ok(res.body.message.includes('required'));
        });

        it('resets password successfully', async () => {
            queueQueryResponse(async () => [[{ id: 1, user_id: userId, token_hash: tokenHash, expires_at: new Date(Date.now() + 1800000) }]]);
                queueQueryResponse(async () => []);
                queueQueryResponse(async () => []);
                queueQueryResponse(async () => []);

            const req = mockReq({ token: resetToken, password: 'newpassword123' });
            const res = mockRes();
            await authController.resetPassword(req, res);

            assert.equal(res.statusCode, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.message, 'Password reset successfully');
        });

        it('returns 400 for invalid token', async () => {
            const req = mockReq({ token: 'invalid.token.here', password: 'newpassword123' });
            const res = mockRes();
            await authController.resetPassword(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.body.success, false);
        });
    });
});
