-- Sawaari (Rapido Clone) — Chat feature migration
-- Run ONCE against the rapido_clone database:
--   mysql -u root -p rapido_clone < DATABASE_MIGRATION_chat.sql
--
-- The Node backend also creates this table lazily on first chat use
-- (see backend/src/services/chat.service.js), so this file is optional
-- for local dev but recommended for production.

CREATE TABLE IF NOT EXISTS ride_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    sender_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_ride_messages_ride (ride_id, id),
    INDEX idx_ride_messages_sender (sender_id)
);
