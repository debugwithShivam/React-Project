-- ============================================================
-- SAWAARI / Rapido-Clone — Security Migration v3
-- Adds missing indexes and constraints for auth performance
-- and security.  Safe to run on existing data.
-- Run AFTER DATABASE_MIGRATION_v2.sql.
-- MySQL 8+ / MariaDB.
-- ============================================================

USE rapido_clone;

-- ============================================================
-- 1) refresh_tokens table
--    Assumed structure: id, user_id, token_hash, expires_at
-- ============================================================

-- Index for fast look-up by user_id (used on every token-refresh / logout call)
ALTER TABLE refresh_tokens
    ADD INDEX IF NOT EXISTS idx_refresh_tokens_user (user_id),
    -- Index to accelerate cleanup of expired tokens
    ADD INDEX IF NOT EXISTS idx_refresh_tokens_expires (expires_at);

-- ============================================================
-- 2) password_reset_tokens table
--    Assumed structure: id, user_id, token_hash, expires_at
--    The service uses ON DUPLICATE KEY UPDATE which requires a
--    UNIQUE constraint on user_id (one pending reset per user).
-- ============================================================

ALTER TABLE password_reset_tokens
    ADD UNIQUE INDEX IF NOT EXISTS uq_password_reset_user (user_id),
    ADD INDEX IF NOT EXISTS idx_password_reset_expires (expires_at);

-- ============================================================
-- 3) users table — ensure UNIQUE constraints for phone/email
-- ============================================================

-- Phone must be unique (10-digit normalised form stored)
-- Assumption: if a UNIQUE index already exists this is a no-op.
ALTER TABLE users
    ADD UNIQUE INDEX IF NOT EXISTS uq_users_phone (phone);

-- email UNIQUE only on non-NULL values — MySQL/MariaDB handles this
-- correctly: multiple NULLs are allowed even with a UNIQUE index.
ALTER TABLE users
    ADD UNIQUE INDEX IF NOT EXISTS uq_users_email (email);

-- ============================================================
-- 4) drivers table — unique vehicle plate and driving license
-- ============================================================

ALTER TABLE drivers
    ADD UNIQUE INDEX IF NOT EXISTS uq_drivers_vehicle_plate (vehicle_plate),
    ADD UNIQUE INDEX IF NOT EXISTS uq_drivers_driving_license (driving_license);

-- ============================================================
-- 5) Periodic cleanup of expired tokens
--    (Optional — run manually or via a scheduled event)
-- ============================================================

-- DELETE FROM refresh_tokens WHERE expires_at < NOW();
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW();

-- ============================================================
-- VERIFY with:
--   SHOW INDEX FROM refresh_tokens;
--   SHOW INDEX FROM password_reset_tokens;
--   SHOW INDEX FROM users;
--   SHOW INDEX FROM drivers;
-- ============================================================
