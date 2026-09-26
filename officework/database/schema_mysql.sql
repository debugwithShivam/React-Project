create table if not exists admins (
    id bigint unsigned primary key auto_increment,
    name varchar(120) not null,
    email varchar(190) not null unique,
    password varchar(255) not null,
    role varchar(60) not null default 'super_admin',
    zone_id bigint unsigned null,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists zones (
    id bigint unsigned primary key auto_increment,
    name varchar(190) not null,
    city varchar(120) null,
    state varchar(120) null,
    pincode varchar(40) null,
    pincodes text null,
    latitude decimal(10,7) null,
    longitude decimal(10,7) null,
    radius_km decimal(8,2) not null default 0,
    status tinyint(1) not null default 1,
    sort_order int not null default 0,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists categories (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    name varchar(190) not null,
    slug varchar(220) not null,
    image varchar(255) null,
    shipping_cost decimal(12,2) not null default 0,
    status tinyint(1) not null default 1,
    sort_order int not null default 0,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists subcategories (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    category_id bigint unsigned not null,
    name varchar(190) not null,
    slug varchar(220) not null,
    image varchar(255) null,
    status tinyint(1) not null default 1,
    sort_order int not null default 0,
    created_at timestamp null,
    updated_at timestamp null,
    index subcategories_module_category_index (module_key, category_id),
    unique key subcategories_module_slug_unique (module_key, slug)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists brands (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    name varchar(190) not null,
    slug varchar(220) not null,
    image varchar(255) null,
    status tinyint(1) not null default 1,
    sort_order int not null default 0,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists products (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    zone_id bigint unsigned null,
    vendor_id bigint unsigned null,
    brand_id bigint unsigned null,
    category_id bigint unsigned null,
    subcategory_id bigint unsigned null,
    name varchar(190) not null,
    slug varchar(220) not null,
    description text null,
    unit varchar(60) not null default 'piece',
    price decimal(12,2) not null default 0,
    discount_price decimal(12,2) null,
    stock int not null default 0,
    sku varchar(120) null,
    thumbnail varchar(255) null,
    tax_percent decimal(8,2) not null default 0,
    shipping_cost decimal(12,2) not null default 0,
    barcode varchar(255) null,
    seo_title varchar(255) null,
    seo_description text null,
    attributes_json text null,
    colors_json text null,
    is_digital tinyint(1) not null default 0,
    digital_file_url text null,
    is_flash_deal tinyint(1) not null default 0,
    flash_deal_ends_at datetime null,
    is_clearance tinyint(1) not null default 0,
    medicine_type varchar(255) null,
    schedule_tag varchar(255) null,
    max_qty_per_order int null,
    max_qty_per_month int null,
    requires_pharmacist_review tinyint(1) not null default 0,
    requires_age_confirmation tinyint(1) not null default 0,
    provider_visibility tinyint(1) not null default 1,
    allows_substitution tinyint(1) not null default 1,
    status tinyint(1) not null default 1,
    is_featured tinyint(1) not null default 0,
    created_at timestamp null,
    updated_at timestamp null,
    index products_category_id_index (category_id),
    index products_subcategory_id_index (subcategory_id),
    index products_brand_id_index (brand_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists product_images (
    id bigint unsigned primary key auto_increment,
    product_id bigint unsigned not null,
    image varchar(255) not null,
    sort_order int not null default 0,
    created_at timestamp null,
    index product_images_product_id_index (product_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists product_variants (
    id bigint unsigned primary key auto_increment,
    product_id bigint unsigned not null,
    name varchar(190) not null,
    unit varchar(60) not null default 'piece',
    price decimal(12,2) not null default 0,
    discount_price decimal(12,2) null,
    stock int not null default 0,
    sku varchar(120) null,
    status tinyint(1) not null default 1,
    created_at timestamp null,
    updated_at timestamp null,
    index product_variants_product_id_index (product_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists banners (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    title varchar(190) null,
    image varchar(255) null,
    link_type varchar(40) not null default 'none',
    link_value varchar(255) null,
    status tinyint(1) not null default 1,
    sort_order int not null default 0,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists carts (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    guest_id varchar(120) not null,
    product_id bigint unsigned not null,
    variant_id bigint unsigned null,
    quantity int not null default 1,
    price decimal(12,2) not null default 0,
    created_at timestamp null,
    updated_at timestamp null,
    index carts_guest_id_index (guest_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists coupons (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    code varchar(80) not null unique,
    title varchar(190) not null,
    discount_type varchar(20) not null default 'flat',
    discount_value decimal(12,2) not null default 0,
    minimum_order_amount decimal(12,2) not null default 0,
    maximum_discount decimal(12,2) null,
    usage_limit int null,
    used_count int not null default 0,
    starts_at date null,
    expires_at date null,
    status tinyint(1) not null default 1,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists cart_coupons (
    guest_id varchar(120) primary key,
    module_key varchar(40) not null default 'mart',
    coupon_id bigint unsigned not null,
    code varchar(80) not null,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists customers (
    id bigint unsigned primary key auto_increment,
    name varchar(190) not null,
    phone varchar(60) not null unique,
    email varchar(190) null,
    password varchar(255) null,
    auth_token varchar(128) null,
    status tinyint(1) not null default 1,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists customer_addresses (
    id bigint unsigned primary key auto_increment,
    customer_id bigint unsigned not null,
    label varchar(80) null,
    contact_name varchar(190) null,
    contact_phone varchar(60) null,
    address text not null,
    city varchar(120) null,
    state varchar(120) null,
    pincode varchar(30) null,
    is_default tinyint(1) not null default 0,
    created_at timestamp null,
    updated_at timestamp null,
    index customer_addresses_customer_id_index (customer_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists vendors (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    zone_id bigint unsigned null,
    shop_name varchar(190) not null,
    owner_name varchar(190) not null,
    phone varchar(60) not null,
    email varchar(190) null,
    password varchar(255) not null,
    auth_token varchar(128) null,
    address text null,
    city varchar(120) null,
    status varchar(40) not null default 'pending',
    admin_note text null,
    created_at timestamp null,
    updated_at timestamp null,
    unique key vendors_module_phone_unique (module_key, phone)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists delivery_men (
    id bigint unsigned primary key auto_increment,
    name varchar(190) not null,
    phone varchar(60) not null,
    email varchar(190) null,
    password varchar(255) null,
    auth_token varchar(255) null,
    auth_token_expires_at timestamp null,
    zone_id bigint unsigned null,
    vehicle_type varchar(80) null,
    vehicle_number varchar(80) null,
    availability_status varchar(40) not null default 'offline',
    current_latitude decimal(10,7) null,
    current_longitude decimal(10,7) null,
    last_seen_at timestamp null,
    status tinyint(1) not null default 1,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists orders (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    zone_id bigint unsigned null,
    vendor_id bigint unsigned null,
    delivery_man_id bigint unsigned null,
    order_number varchar(80) not null unique,
    guest_id varchar(120) null,
    customer_id bigint unsigned null,
    customer_name varchar(190) null,
    customer_phone varchar(60) null,
    customer_email varchar(190) null,
    address text null,
    order_amount decimal(12,2) not null default 0,
    coupon_code varchar(80) null,
    coupon_discount decimal(12,2) not null default 0,
    tax_total decimal(12,2) not null default 0,
    shipping_method_id bigint unsigned null,
    shipping_method_name varchar(120) null,
    shipping_cost decimal(12,2) not null default 0,
    expected_delivery varchar(80) null,
    payment_method varchar(60) not null default 'cash_on_delivery',
    payment_status varchar(60) not null default 'unpaid',
    order_status varchar(60) not null default 'pending',
    delivery_assigned_at timestamp null,
    delivery_decision varchar(30) not null default 'pending',
    delivery_decision_at timestamp null,
    delivery_decision_note varchar(255) null,
    tracking_provider varchar(120) null,
    tracking_number varchar(190) null,
    tracking_url varchar(500) null,
    order_note text null,
    substitution_preference varchar(40) not null default 'call_before_replace',
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists delivery_locations (
    id bigint unsigned primary key auto_increment,
    delivery_man_id bigint unsigned not null,
    order_id bigint unsigned null,
    latitude decimal(10,7) not null,
    longitude decimal(10,7) not null,
    recorded_at timestamp not null,
    index delivery_locations_worker_index (delivery_man_id, recorded_at),
    index delivery_locations_order_index (order_id, recorded_at)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists order_items (
    id bigint unsigned primary key auto_increment,
    order_id bigint unsigned not null,
    vendor_id bigint unsigned null,
    product_id bigint unsigned not null,
    variant_id bigint unsigned null,
    variant_name varchar(190) null,
    product_name varchar(190) not null,
    quantity int not null default 1,
    price decimal(12,2) not null default 0,
    total decimal(12,2) not null default 0,
    status varchar(60) not null default 'pending',
    created_at timestamp null,
    updated_at timestamp null,
    index order_items_order_id_index (order_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists order_status_history (
    id bigint unsigned primary key auto_increment,
    order_id bigint unsigned not null,
    order_item_id bigint unsigned null,
    status varchar(60) not null,
    actor_type varchar(40) not null,
    actor_name varchar(190) null,
    note text null,
    created_at timestamp null,
    index order_status_history_order_id_index (order_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists notifications (
    id bigint unsigned primary key auto_increment,
    recipient_type varchar(40) not null,
    recipient_id bigint unsigned null,
    guest_id varchar(120) null,
    title varchar(190) not null,
    message text null,
    order_id bigint unsigned null,
    read_at timestamp null,
    created_at timestamp null,
    index notifications_recipient_index (recipient_type, recipient_id),
    index notifications_guest_id_index (guest_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists wishlists (
    id bigint unsigned primary key auto_increment,
    guest_id varchar(120) not null,
    product_id bigint unsigned not null,
    created_at timestamp null,
    unique key wishlists_guest_product_unique (guest_id, product_id),
    index wishlists_guest_id_index (guest_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists product_reviews (
    id bigint unsigned primary key auto_increment,
    product_id bigint unsigned not null,
    vendor_id bigint unsigned null,
    guest_id varchar(120) not null,
    customer_name varchar(190) null,
    rating tinyint unsigned not null default 5,
    comment text null,
    reply text null,
    status tinyint(1) not null default 1,
    created_at timestamp null,
    updated_at timestamp null,
    index product_reviews_product_id_index (product_id),
    index product_reviews_vendor_id_index (vendor_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists refund_requests (
    id bigint unsigned primary key auto_increment,
    order_id bigint unsigned not null,
    order_item_id bigint unsigned null,
    vendor_id bigint unsigned null,
    guest_id varchar(120) null,
    customer_name varchar(190) null,
    customer_phone varchar(60) null,
    amount decimal(12,2) not null default 0,
    reason varchar(255) not null,
    note text null,
    admin_note text null,
    currency varchar(10) not null default 'INR',
    status varchar(40) not null default 'pending',
    created_at timestamp null,
    updated_at timestamp null,
    index refund_requests_order_id_index (order_id),
    index refund_requests_vendor_id_index (vendor_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists payment_transactions (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null default 'mart',
    order_id bigint unsigned not null,
    guest_id varchar(120) null,
    customer_name varchar(190) null,
    customer_phone varchar(60) null,
    payment_method varchar(60) not null,
    amount decimal(12,2) not null default 0,
    currency varchar(10) not null default 'INR',
    reference varchar(255) null,
    note text null,
    status varchar(40) not null default 'pending',
    admin_note text null,
    gateway_response text null,
    reconciled_at timestamp null,
    reconciled_by varchar(190) null,
    created_at timestamp null,
    updated_at timestamp null,
    index payment_transactions_order_id_index (order_id),
    index payment_transactions_status_index (status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists payment_webhook_events (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null,
    event_key varchar(190) not null,
    payload_hash varchar(64) not null,
    status varchar(40) not null default 'processed',
    received_at timestamp null,
    processed_at timestamp null,
    unique key payment_webhook_events_key_unique (module_key, event_key),
    index payment_webhook_events_hash_index (payload_hash)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists support_threads (
    id bigint unsigned primary key auto_increment, module_key varchar(40) not null default 'mart',
    subject varchar(190) not null, guest_id varchar(190) null, customer_id bigint unsigned null,
    vendor_id bigint unsigned null, order_id bigint unsigned null, booking_id bigint unsigned null,
    status varchar(40) not null default 'open', created_at timestamp null, updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists support_messages (
    id bigint unsigned primary key auto_increment, thread_id bigint unsigned not null,
    sender_type varchar(40) not null, sender_name varchar(190) null, message text not null,
    attachment_url varchar(255) null, customer_read_at timestamp null, admin_read_at timestamp null,
    vendor_read_at timestamp null, created_at timestamp null, index support_messages_thread_index (thread_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists wallet_accounts (
    id bigint unsigned primary key auto_increment,
    owner_type varchar(40) not null,
    owner_key varchar(190) not null,
    balance decimal(12,2) not null default 0,
    created_at timestamp null,
    updated_at timestamp null,
    unique key wallet_accounts_owner_unique (owner_type, owner_key)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists wallet_ledgers (
    id bigint unsigned primary key auto_increment,
    wallet_account_id bigint unsigned not null,
    owner_type varchar(40) not null,
    owner_key varchar(190) not null,
    direction varchar(20) not null,
    amount decimal(12,2) not null default 0,
    entry_type varchar(60) not null,
    reference_key varchar(190) null,
    description text null,
    created_at timestamp null,
    updated_at timestamp null,
    unique key wallet_ledgers_reference_unique (owner_type, owner_key, reference_key),
    index wallet_ledgers_account_index (wallet_account_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists withdrawal_requests (
    id bigint unsigned primary key auto_increment,
    vendor_id bigint unsigned not null default 0,
    owner_type varchar(40) not null default 'vendor',
    owner_key varchar(190) null,
    amount decimal(12,2) not null default 0,
    bank_details text null,
    note text null,
    status varchar(40) not null default 'pending',
    admin_note text null,
    created_at timestamp null,
    updated_at timestamp null,
    index withdrawal_requests_vendor_index (vendor_id),
    index withdrawal_requests_status_index (status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists shipping_methods (
    id bigint unsigned primary key auto_increment,
    name varchar(120) not null,
    description text null,
    cost decimal(12,2) not null default 0,
    expected_days varchar(80) null,
    sort_order int not null default 0,
    status tinyint not null default 1,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_categories (
    id bigint unsigned primary key auto_increment,
    name varchar(190) not null,
    description text null,
    status tinyint not null default 1,
    sort_order int not null default 0,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_owners (
    id bigint unsigned primary key auto_increment,
    name varchar(190) not null,
    phone varchar(40) null,
    email varchar(190) null,
    password varchar(255) null,
    status tinyint not null default 1,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotels (
    id bigint unsigned primary key auto_increment,
    zone_id bigint unsigned null,
    owner_id bigint unsigned null,
    category_id bigint unsigned null,
    name varchar(190) not null,
    city varchar(120) not null,
    area varchar(190) null,
    address text not null,
    description text null,
    star_rating decimal(3,1) not null default 0,
    rating decimal(3,2) not null default 0,
    review_count int not null default 0,
    amenities_json text null,
    thumbnail varchar(255) null,
    gallery_json text null,
    status tinyint not null default 1,
    is_featured tinyint not null default 0,
    check_in_time varchar(20) null,
    check_out_time varchar(20) null,
    created_at timestamp null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_rooms (
    id bigint unsigned primary key auto_increment,
    hotel_id bigint unsigned not null,
    name varchar(190) not null,
    description text null,
    capacity_adults int not null default 2,
    capacity_children int not null default 0,
    total_rooms int not null default 1,
    price_per_night decimal(12,2) not null default 0,
    discount_price decimal(12,2) null,
    tax_percent decimal(6,2) not null default 0,
    amenities_json text null,
    thumbnail varchar(255) null,
    max_advance_days int not null default 365,
    status tinyint not null default 1,
    created_at timestamp null,
    updated_at timestamp null,
    index hotel_rooms_hotel_index (hotel_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_bookings (
    id bigint unsigned primary key auto_increment,
    booking_number varchar(80) not null unique,
    zone_id bigint unsigned null,
    hotel_id bigint unsigned not null,
    room_id bigint unsigned not null,
    guest_id varchar(190) null,
    customer_name varchar(190) not null,
    customer_phone varchar(40) not null,
    customer_email varchar(190) null,
    check_in date not null,
    check_out date not null,
    nights int not null default 1,
    rooms int not null default 1,
    adults int not null default 1,
    children int not null default 0,
    room_total decimal(12,2) not null default 0,
    tax_total decimal(12,2) not null default 0,
    grand_total decimal(12,2) not null default 0,
    payment_method varchar(60) not null default 'pay_at_hotel',
    payment_reference varchar(190) null,
    payment_note text null,
    payment_status varchar(40) not null default 'unpaid',
    booking_status varchar(40) not null default 'pending',
    cancellation_reason text null,
    refund_status varchar(40) not null default 'none',
    refund_amount decimal(12,2) not null default 0,
    refund_note text null,
    admin_note text null,
    cancelled_at timestamp null,
    completed_at timestamp null,
    created_at timestamp null,
    updated_at timestamp null,
    index hotel_bookings_guest_index (guest_id),
    index hotel_bookings_room_dates_index (room_id, check_in, check_out)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_blackouts (
    id bigint unsigned primary key auto_increment,
    hotel_id bigint unsigned null,
    room_id bigint unsigned null,
    title varchar(190) not null,
    starts_at date not null,
    ends_at date not null,
    repeat_type varchar(40) not null default 'none',
    status tinyint not null default 1,
    created_at timestamp null,
    updated_at timestamp null,
    index hotel_blackouts_dates_index (starts_at, ends_at),
    index hotel_blackouts_room_index (room_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_payment_transactions (
    id bigint unsigned primary key auto_increment,
    booking_id bigint unsigned not null,
    guest_id varchar(190) null,
    customer_name varchar(190) null,
    customer_phone varchar(40) null,
    payment_method varchar(60) not null,
    amount decimal(12,2) not null default 0,
    reference varchar(190) null,
    note text null,
    status varchar(40) not null default 'pending',
    gateway_response text null,
    reconciled_at timestamp null,
    reconciled_by varchar(190) null,
    created_at timestamp null,
    updated_at timestamp null,
    index hotel_payment_booking_index (booking_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists hotel_reviews (
    id bigint unsigned primary key auto_increment,
    hotel_id bigint unsigned not null,
    booking_id bigint unsigned null,
    guest_id varchar(190) null,
    customer_name varchar(190) not null,
    rating tinyint unsigned not null default 5,
    comment text null,
    status tinyint not null default 1,
    created_at timestamp null,
    updated_at timestamp null,
    index hotel_reviews_hotel_index (hotel_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_prescriptions (
    id bigint unsigned primary key auto_increment,
    order_id bigint unsigned not null,
    guest_id varchar(190) null,
    customer_name varchar(190) null,
    customer_phone varchar(40) null,
    reference varchar(190) null,
    file_path varchar(255) null,
    note text null,
    status varchar(40) not null default 'pending',
    admin_note text null,
    reviewed_by varchar(190) null,
    reviewed_at timestamp null,
    created_at timestamp null,
    updated_at timestamp null,
    index medical_prescriptions_order_index (order_id),
    index medical_prescriptions_status_index (status)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_providers (
    id bigint unsigned primary key auto_increment,
    provider_type varchar(30) not null,
    name varchar(190) not null,
    business_name varchar(190) null,
    phone varchar(60) not null,
    email varchar(190) null,
    password_hash varchar(255) null,
    auth_token varchar(64) null,
    license_number varchar(120) null,
    speciality varchar(120) null,
    qualification varchar(190) null,
    experience_years int not null default 0,
    consultation_fee decimal(12,2) not null default 0,
    service_modes varchar(120) null,
    vendor_id bigint unsigned null,
    zone_id bigint unsigned null,
    address text null,
    city varchar(120) null,
    description text null,
    opening_hours varchar(190) null,
    profile_image varchar(255) null,
    service_radius_km decimal(12,2) not null default 0,
    home_collection_fee decimal(12,2) not null default 0,
    default_delivery_fee decimal(12,2) not null default 0,
    availability_text varchar(190) null,
    status varchar(30) not null default 'pending',
    created_at timestamp null,
    updated_at timestamp null,
    unique key medical_providers_role_phone_unique (provider_type, phone)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_lab_tests (
    id bigint unsigned primary key auto_increment,
    provider_id bigint unsigned null,
    zone_id bigint unsigned null,
    name varchar(190) not null,
    code varchar(80) null,
    description text null,
    price decimal(12,2) not null default 0,
    preparation text null,
    report_hours int not null default 24,
    home_collection tinyint not null default 1,
    status varchar(30) not null default 'active',
    created_at timestamp null,
    updated_at timestamp null,
    index medical_lab_tests_provider_index (provider_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_lab_bookings (
    id bigint unsigned primary key auto_increment,
    test_id bigint unsigned not null,
    provider_id bigint unsigned null,
    zone_id bigint unsigned null,
    guest_id varchar(190) not null,
    customer_id bigint unsigned null,
    customer_name varchar(190) not null,
    customer_phone varchar(60) not null,
    address text null,
    collection_mode varchar(30) not null default 'home',
    scheduled_at varchar(60) not null,
    amount decimal(12,2) not null default 0,
    status varchar(30) not null default 'requested',
    payment_status varchar(30) not null default 'pending',
    report_url varchar(255) null,
     provider_note text null, payment_method varchar(60) not null default 'cash_on_service',
     payment_reference varchar(255) null, payment_note text null,
    created_at timestamp null,
    updated_at timestamp null,
    index medical_lab_bookings_guest_index (guest_id),
    index medical_lab_bookings_provider_index (provider_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_consultations (
    id bigint unsigned primary key auto_increment,
    doctor_id bigint unsigned not null,
    zone_id bigint unsigned null,
    guest_id varchar(190) not null,
    customer_id bigint unsigned null,
    customer_name varchar(190) not null,
    customer_phone varchar(60) not null,
    reason text null,
    consultation_mode varchar(30) not null default 'online',
    scheduled_at varchar(60) not null,
    amount decimal(12,2) not null default 0,
    status varchar(30) not null default 'requested',
    payment_status varchar(30) not null default 'pending',
    meeting_url varchar(255) null,
    clinical_note text null,
     prescription_url varchar(255) null, payment_method varchar(60) not null default 'cash_on_service',
     payment_reference varchar(255) null, payment_note text null,
    created_at timestamp null,
    updated_at timestamp null,
    index medical_consultations_guest_index (guest_id),
    index medical_consultations_doctor_index (doctor_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_prescription_requests (
    id bigint unsigned primary key auto_increment,
    pharmacy_id bigint unsigned null,
    order_id bigint unsigned null,
    zone_id bigint unsigned null,
    guest_id varchar(190) not null,
    customer_id bigint unsigned null,
    customer_name varchar(190) not null,
    customer_phone varchar(60) not null,
    file_path varchar(255) not null,
    note text null,
    substitution_preference varchar(40) not null default 'contact_me',
    status varchar(30) not null default 'pending_review',
    payment_status varchar(30) not null default 'not_due',
    accepted_quote_id bigint unsigned null,
    created_at timestamp null,
    updated_at timestamp null,
    index medical_rx_requests_guest_index (guest_id),
    index medical_rx_requests_pharmacy_index (pharmacy_id),
    index medical_rx_requests_order_index (order_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_prescription_quotes (
    id bigint unsigned primary key auto_increment,
    request_id bigint unsigned not null,
    pharmacy_id bigint unsigned not null,
    subtotal decimal(12,2) not null default 0,
    tax_total decimal(12,2) not null default 0,
    delivery_fee decimal(12,2) not null default 0,
    total decimal(12,2) not null default 0,
    status varchar(30) not null default 'offered',
    note text null,
    expires_at varchar(60) null,
    accepted_at timestamp null,
    created_at timestamp null,
    updated_at timestamp null,
    index medical_rx_quotes_request_index (request_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_prescription_quote_items (
    id bigint unsigned primary key auto_increment,
    quote_id bigint unsigned not null,
    medicine_name varchar(190) not null,
    pack varchar(120) null,
    quantity int not null default 1,
    unit_price decimal(12,2) not null default 0,
    tax_amount decimal(12,2) not null default 0,
    line_total decimal(12,2) not null default 0,
    substitution_for varchar(190) null,
    created_at timestamp null,
    index medical_rx_quote_items_quote_index (quote_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists medical_payment_transactions (
    id bigint unsigned primary key auto_increment,
    entity_type varchar(30) not null,
    entity_id bigint unsigned not null,
    guest_id varchar(190) not null,
    payment_method varchar(60) not null default 'manual',
    amount decimal(12,2) not null default 0,
    currency varchar(10) not null default 'INR',
    reference varchar(255) null,
    note text null,
    status varchar(40) not null default 'pending',
    gateway_response text null,
    reconciled_at timestamp null,
    reconciled_by varchar(190) null,
    created_at timestamp null,
    updated_at timestamp null,
    unique key medical_payment_entity_unique (entity_type, entity_id),
    index medical_payment_guest_index (guest_id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
create table if not exists medical_conversations (
    id bigint unsigned primary key auto_increment, customer_id bigint unsigned not null,
    provider_id bigint unsigned not null, entity_type varchar(30) not null, entity_id bigint unsigned not null,
    customer_last_read_at timestamp null, provider_last_read_at timestamp null,
    created_at timestamp null, updated_at timestamp null,
    unique key medical_conversations_entity_unique (entity_type, entity_id),
    index medical_conversations_customer_index (customer_id, id), index medical_conversations_provider_index (provider_id, id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
create table if not exists medical_conversation_messages (
    id bigint unsigned primary key auto_increment, conversation_id bigint unsigned not null,
    sender_type varchar(20) not null, sender_id bigint unsigned not null, body text not null, created_at timestamp null,
    index medical_conversation_messages_cursor_index (conversation_id, id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists schema_migrations (
    id bigint unsigned primary key auto_increment,
    migration varchar(190) not null unique,
    applied_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists settings (
    key_name varchar(120) primary key,
    value text null,
    updated_at timestamp null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists push_outbox (
    id bigint unsigned primary key auto_increment,
    module_key varchar(40) not null,
    recipient_type varchar(40) not null,
    recipient_id bigint unsigned null,
    guest_id varchar(190) null,
    title varchar(190) not null,
    message text null,
    data_json text null,
    attempts int not null default 0,
    last_error text null,
    sent_at timestamp null,
    created_at timestamp null,
    updated_at timestamp null,
    index push_outbox_pending_index (sent_at, attempts)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
