import rateLimit from 'express-rate-limit';

/**
 * Tight limiter for authentication endpoints that are targets for
 * brute-force and credential-stuffing attacks.
 * 10 attempts per IP per 15 minutes.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts from this IP, please try again later.',
    },
    skipSuccessfulRequests: false,
});

/**
 * Limiter for password-reset endpoints — slightly more lenient than
 * login (typos happen) but still prevents enumeration via timing.
 * 5 attempts per IP per 15 minutes.
 */
export const passwordResetRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
    },
});

/**
 * General API rate limiter — a broad safety net.
 * 200 requests per IP per 15 minutes.
 */
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    // High-frequency driver telemetry is exempt so live location pings are
    // never throttled; the socket layer is the primary transport anyway.
    skip: (req) => req.path === '/driver/location',
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
});
