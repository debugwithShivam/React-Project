-- ============================================================
-- SAWAARI / Rapido-Clone — DB Migration v2
-- Run this AFTER your existing rapido_clone schema is created.
-- Safe to run on existing data (uses  / ADD COLUMN )
-- MySQL 8+ recommended (MariaDB also OK).
-- ============================================================

USE rapido_clone;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1) ALTER existing tables
-- ============================================================

ALTER TABLE users
    ADD COLUMN  wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  rating_count INT NOT NULL DEFAULT 0,
    ADD COLUMN  referral_code VARCHAR(20) NULL,
    ADD COLUMN  fcm_token VARCHAR(500) NULL,
    ADD COLUMN  city VARCHAR(100) NULL;

ALTER TABLE drivers
    ADD COLUMN  is_online BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN  current_lat DECIMAL(10,7) NULL,
    ADD COLUMN  current_lng DECIMAL(10,7) NULL,
    ADD COLUMN  last_location_update DATETIME NULL,
    ADD COLUMN  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  rating_count INT NOT NULL DEFAULT 0,
    ADD COLUMN  total_rides INT NOT NULL DEFAULT 0,
    ADD COLUMN  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  fcm_token VARCHAR(500) NULL,
    ADD COLUMN  rejection_reason VARCHAR(500) NULL;

ALTER TABLE rides
    ADD COLUMN  scheduled_at DATETIME NULL,
    ADD COLUMN  distance_km DECIMAL(10,2) NULL,
    ADD COLUMN  duration_min INT NULL,
    ADD COLUMN  start_otp VARCHAR(6) NULL,
    ADD COLUMN  accepted_at DATETIME NULL,
    ADD COLUMN  arrived_at DATETIME NULL,
    ADD COLUMN  started_at DATETIME NULL,
    ADD COLUMN  completed_at DATETIME NULL,
    ADD COLUMN  cancelled_at DATETIME NULL,
    ADD COLUMN  cancelled_by ENUM('USER','DRIVER','ADMIN','SYSTEM') NULL,
    ADD COLUMN  cancellation_reason VARCHAR(255) NULL,
    ADD COLUMN  cancellation_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  payment_method ENUM('CASH','ONLINE','WALLET') NOT NULL DEFAULT 'CASH',
    ADD COLUMN  payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN  coupon_id BIGINT UNSIGNED NULL,
    ADD COLUMN  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  driver_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ADD COLUMN  is_scheduled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN  is_sos BOOLEAN NOT NULL DEFAULT FALSE,
    MODIFY COLUMN status ENUM('SCHEDULED','SEARCHING','ACCEPTED','ARRIVING','STARTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SEARCHING';

-- ============================================================
-- 2) NEW tables
-- ============================================================

CREATE TABLE  vehicle_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,         -- BIKE / AUTO / CAB / CAB_XL
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    icon_url VARCHAR(500),
    capacity INT NOT NULL DEFAULT 1,
    base_fare DECIMAL(10,2) NOT NULL DEFAULT 30.00,
    per_km_fare DECIMAL(10,2) NOT NULL DEFAULT 8.00,
    per_min_fare DECIMAL(10,2) NOT NULL DEFAULT 1.50,
    minimum_fare DECIMAL(10,2) NOT NULL DEFAULT 30.00,
    cancellation_fee DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    commission_percent DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE  cities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    center_lat DECIMAL(10,7),
    center_lng DECIMAL(10,7),
    radius_km DECIMAL(6,2) NOT NULL DEFAULT 25.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE  coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('FLAT','PERCENT') NOT NULL DEFAULT 'FLAT',
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount DECIMAL(10,2) NULL,
    min_fare DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    usage_limit INT NOT NULL DEFAULT 0,       -- 0 = unlimited
    per_user_limit INT NOT NULL DEFAULT 1,
    used_count INT NOT NULL DEFAULT 0,
    applicable_vehicle_types VARCHAR(255) NULL,  -- comma-separated codes, NULL = all
    applicable_roles VARCHAR(50) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE  coupon_redemptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    ride_id BIGINT UNSIGNED NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE  ratings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT UNSIGNED NOT NULL,
    rater_id BIGINT UNSIGNED NOT NULL,
    ratee_id BIGINT UNSIGNED NOT NULL,
    rater_role ENUM('USER','DRIVER') NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_rating (ride_id, rater_id),
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE  complaints (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ride_id BIGINT UNSIGNED NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    priority ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
    assigned_to BIGINT UNSIGNED NULL,
    resolution TEXT NULL,
    resolved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
);

CREATE TABLE  notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    data_json JSON NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

CREATE TABLE  wallet_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type ENUM('CREDIT','DEBIT') NOT NULL,
    reason VARCHAR(100) NOT NULL,           -- TOPUP, RIDE_PAYMENT, REFUND, PAYOUT, BONUS, COMMISSION
    reference_type VARCHAR(50) NULL,
    reference_id BIGINT UNSIGNED NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at)
);

CREATE TABLE  payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT UNSIGNED NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('CASH','RAZORPAY','WALLET') NOT NULL,
    status ENUM('INITIATED','PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'INITIATED',
    gateway_order_id VARCHAR(100) NULL,
    gateway_payment_id VARCHAR(100) NULL,
    gateway_signature VARCHAR(255) NULL,
    refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    failure_reason VARCHAR(255) NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_gateway_order (gateway_order_id)
);

CREATE TABLE  payouts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    driver_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    upi VARCHAR(150) NOT NULL,
    status ENUM('REQUESTED','PROCESSING','PAID','REJECTED') NOT NULL DEFAULT 'REQUESTED',
    reference_number VARCHAR(100) NULL,
    notes VARCHAR(500) NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME NULL,
    processed_by BIGINT UNSIGNED NULL,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

CREATE TABLE  dynamic_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,         -- privacy-policy, terms, about, contact, safety, faq
    title VARCHAR(200) NOT NULL,
    content_html MEDIUMTEXT NOT NULL,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE  settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    value_type ENUM('STRING','NUMBER','BOOLEAN','JSON') NOT NULL DEFAULT 'STRING',
    setting_group VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE  ride_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NULL,
    event_type VARCHAR(50) NOT NULL,           -- CREATED, SEARCHING, ACCEPTED, ARRIVED, STARTED, COMPLETED, CANCELLED, LOCATION
    lat DECIMAL(10,7) NULL,
    lng DECIMAL(10,7) NULL,
    payload_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    INDEX idx_ride_time (ride_id, created_at)
);

CREATE TABLE  sos_alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    status ENUM('ACTIVE','RESOLVED','FALSE_ALARM') NOT NULL DEFAULT 'ACTIVE',
    resolved_by BIGINT UNSIGNED NULL,
    resolved_at DATETIME NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE  admin_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL DEFAULT 'ADMIN',  -- SUPER_ADMIN, ADMIN, SUPPORT, FINANCE
    permissions JSON NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3) Seed default vehicle types (idempotent)
-- ============================================================

INSERT IGNORE INTO vehicle_types (code, name, description, capacity, base_fare, per_km_fare, per_min_fare, minimum_fare, cancellation_fee, commission_percent, sort_order) VALUES
('BIKE',    'Bike',       'Two-wheeler ride for solo travellers', 1, 25.00, 6.00, 1.00, 25.00,  5.00, 12.00, 1),
('AUTO',    'Auto',       'Auto-rickshaw for short distances',     3, 30.00, 9.00, 1.50, 30.00, 10.00, 15.00, 2),
('CAB',     'Cab',        'Sedan / hatchback for 4 passengers',    4, 50.00, 12.00, 2.00, 50.00, 15.00, 18.00, 3),
('CAB_XL',  'Cab XL',     'SUV / Innova for groups & luggage',     6, 80.00, 16.00, 2.50, 80.00, 20.00, 20.00, 4);

INSERT IGNORE INTO cities (name, state, center_lat, center_lng, radius_km) VALUES
('Bengaluru', 'Karnataka', 12.9715990, 77.5945630, 30.00),
('Delhi',     'Delhi',     28.7040600, 77.1024930, 35.00),
('Mumbai',    'Maharashtra', 19.0759840, 72.8776560, 30.00),
('Hyderabad', 'Telangana', 17.3850440, 78.4866710, 30.00),
('Chennai',   'Tamil Nadu', 13.0826800, 80.2707180, 25.00),
('Pune',      'Maharashtra', 18.5204300, 73.8567440, 25.00),
('Kolkata',   'West Bengal', 22.5726460, 88.3638950, 25.00);

INSERT IGNORE INTO settings (setting_key, setting_value, value_type, setting_group, description) VALUES
('app_name',                  'Sawaari',         'STRING',  'GENERAL', 'Display name of the app'),
('support_email',             'support@sawaari.com', 'STRING', 'GENERAL', 'Customer support email'),
('support_phone',             '+91-8888888888',  'STRING',  'GENERAL', 'Customer support phone'),
('currency_code',             'INR',             'STRING',  'GENERAL', 'Default currency'),
('currency_symbol',           '₹',                'STRING',  'GENERAL', 'Default currency symbol'),
('country_code',              'IN',              'STRING',  'GENERAL', 'Default country'),
('country_dial_code',         '+91',             'STRING',  'GENERAL', 'Default dial code'),
('driver_search_radius_km',   '5',               'NUMBER',  'RIDE',    'Radius for finding nearby drivers'),
('ride_request_timeout_sec',  '30',              'NUMBER',  'RIDE',    'Seconds a driver has to accept a ride request'),
('max_concurrent_requests',   '5',               'NUMBER',  'RIDE',    'Max drivers to ping simultaneously'),
('cancellation_free_minutes', '3',               'NUMBER',  'RIDE',    'Free cancellation window after driver accepts'),
('default_commission_percent','15',              'NUMBER',  'PAYMENT', 'Fallback commission if vehicle_type missing'),
('razorpay_enabled',          'false',           'BOOLEAN', 'PAYMENT', 'Toggle Razorpay integration'),
('cash_enabled',              'true',            'BOOLEAN', 'PAYMENT', 'Toggle cash payments'),
('wallet_enabled',            'true',            'BOOLEAN', 'PAYMENT', 'Toggle wallet payments'),
('min_payout_amount',         '250',             'NUMBER',  'PAYOUT',  'Minimum driver payout request'),
('sos_email',                 'safety@sawaari.com', 'STRING','SAFETY',  'Email to notify on SOS'),
('maintenance_mode',          'false',           'BOOLEAN', 'GENERAL', 'Block all non-admin traffic when true');

INSERT IGNORE INTO dynamic_pages (slug, title, content_html) VALUES
('privacy-policy',    'Privacy Policy',     '<h2>Privacy Policy</h2><p>Coming soon — update from admin panel.</p>'),
('terms-conditions',  'Terms & Conditions', '<h2>Terms &amp; Conditions</h2><p>Coming soon — update from admin panel.</p>'),
('about-us',          'About Us',           '<h2>About Sawaari</h2><p>Sawaari is a bike, auto and cab booking platform.</p>'),
('contact-us',        'Contact Us',         '<h2>Contact Us</h2><p>Email: support@sawaari.com</p>'),
('safety',            'Safety',             '<h2>Your Safety, Our Priority</h2><p>Every ride is tracked, drivers are KYC-verified, and SOS support is one tap away.</p>'),
('faq',               'FAQs',               '<h2>Frequently Asked Questions</h2><p>Add FAQs from the admin panel.</p>'),
('refund-policy',     'Refund Policy',      '<h2>Refund Policy</h2><p>Refunds are processed within 5–7 business days.</p>');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DONE. Verify with:
--   SHOW TABLES;
--   SELECT * FROM vehicle_types;
--   SELECT * FROM settings;
--   SELECT * FROM dynamic_pages;
-- ============================================================
