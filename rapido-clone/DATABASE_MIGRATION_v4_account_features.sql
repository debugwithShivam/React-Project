-- User account features: saved destinations and saved UPI identifiers.
-- Safe to run repeatedly; backend also creates these tables lazily for local dev.
USE rapido_clone;

CREATE TABLE IF NOT EXISTS saved_places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(20) NOT NULL DEFAULT 'OTHER',
    name VARCHAR(80) NOT NULL,
    address VARCHAR(255) NOT NULL,
    lat DECIMAL(10,7) NULL,
    lng DECIMAL(10,7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_saved_places_user (user_id),
    CONSTRAINT fk_saved_places_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_payment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    method_type ENUM('UPI') NOT NULL DEFAULT 'UPI',
    label VARCHAR(40) NOT NULL DEFAULT 'UPI',
    upi_id VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_upi (user_id, upi_id),
    INDEX idx_payment_methods_user (user_id),
    CONSTRAINT fk_saved_payment_methods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
