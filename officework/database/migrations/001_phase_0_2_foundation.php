<?php

declare(strict_types=1);

return static function (\PDO $db): void {
    $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
    $column = static function (string $table, string $name, string $definition) use ($db, $mysql): void {
        if (!$mysql) {
            $columns = $db->query("pragma table_info($table)")->fetchAll();
            foreach ($columns as $existing) {
                if (($existing['name'] ?? '') === $name) return;
            }
            $db->exec("alter table $table add column $name $definition");
            return;
        }
        $stmt = $db->prepare('select count(*) from information_schema.columns where table_schema = database() and table_name = :table and column_name = :column');
        $stmt->execute(['table' => $table, 'column' => $name]);
        if ((int) $stmt->fetchColumn() === 0) {
            $db->exec("alter table `$table` add column `$name` $definition");
        }
    };

    if (!$mysql) {
        $db->exec("create table if not exists medical_payment_transactions (
            id integer primary key autoincrement, entity_type text not null, entity_id integer not null,
            guest_id text not null, payment_method text not null default 'manual', amount real not null default 0,
            currency text not null default 'INR', reference text, note text, status text not null default 'pending',
            gateway_response text, reconciled_at text, reconciled_by text, created_at text, updated_at text,
            unique(entity_type, entity_id)
        )");
        foreach (['password' => 'text', 'auth_token' => 'text', 'auth_token_expires_at' => 'text', 'zone_id' => 'integer', 'availability_status' => "text not null default 'offline'", 'current_latitude' => 'real', 'current_longitude' => 'real', 'last_seen_at' => 'text'] as $name => $definition) {
            $column('delivery_men', $name, $definition);
        }
        $column('medical_providers', 'zone_id', 'integer');
        $column('medical_providers', 'address_line', 'text');
        $column('medical_providers', 'floor', 'text');
        $column('medical_providers', 'landmark', 'text');
        $column('medical_providers', 'state', 'text');
        $column('medical_providers', 'pincode', 'text');
        $column('medical_providers', 'latitude', 'real');
        $column('medical_providers', 'longitude', 'real');
        $column('medical_providers', 'location_verified_at', 'text');
        $column('medical_lab_tests', 'zone_id', 'integer');
        $column('orders', 'delivery_decision', "text not null default 'pending'");
        $column('orders', 'delivery_decision_at', 'text');
        $column('orders', 'delivery_decision_note', 'text');
        $column('products', 'provider_visibility', 'integer not null default 1');
        $column('products', 'allows_substitution', 'integer not null default 1');
        $column('payment_transactions', 'currency', "text not null default 'INR'");
        $column('medical_payment_transactions', 'gateway_response', 'text');
        foreach (['medical_lab_bookings', 'medical_consultations'] as $table) {
            $column($table, 'payment_method', "text not null default 'cash_on_service'");
            $column($table, 'payment_reference', 'text');
            $column($table, 'payment_note', 'text');
        }
        $db->exec('create table if not exists medical_conversations (id integer primary key autoincrement, customer_id integer not null, provider_id integer not null, entity_type text not null, entity_id integer not null, customer_last_read_at text, provider_last_read_at text, created_at text, updated_at text, unique(entity_type, entity_id))');
        $db->exec('create index if not exists medical_conversations_customer_index on medical_conversations(customer_id, id)');
        $db->exec('create index if not exists medical_conversations_provider_index on medical_conversations(provider_id, id)');
        $db->exec('create table if not exists medical_conversation_messages (id integer primary key autoincrement, conversation_id integer not null, sender_type text not null, sender_id integer not null, body text not null, created_at text)');
        $db->exec('create index if not exists medical_conversation_messages_cursor_index on medical_conversation_messages(conversation_id, id)');
        $db->exec('create table if not exists delivery_locations (id integer primary key autoincrement, delivery_man_id integer not null, order_id integer, latitude real not null, longitude real not null, recorded_at text not null)');
        $db->exec('create index if not exists delivery_locations_worker_index on delivery_locations (delivery_man_id, recorded_at)');
        $db->exec('create index if not exists delivery_locations_order_index on delivery_locations (order_id, recorded_at)');
        return;
    }

    $column('customers', 'password', 'varchar(255) null');
    $column('customers', 'auth_token', 'varchar(128) null');
    $column('orders', 'customer_id', 'bigint unsigned null after guest_id');
    $column('orders', 'tax_total', 'decimal(12,2) not null default 0 after coupon_discount');
    $column('orders', 'substitution_preference', "varchar(40) not null default 'call_before_replace'");
    $column('orders', 'tracking_provider', 'varchar(120) null');
    $column('orders', 'tracking_number', 'varchar(190) null');
    $column('orders', 'tracking_url', 'varchar(500) null');
    $column('orders', 'delivery_assigned_at', 'timestamp null');
    $column('orders', 'delivery_decision', "varchar(30) not null default 'pending'");
    $column('orders', 'delivery_decision_at', 'timestamp null');
    $column('orders', 'delivery_decision_note', 'varchar(255) null');
    $column('delivery_men', 'password', 'varchar(255) null');
    $column('delivery_men', 'auth_token', 'varchar(255) null');
    $column('delivery_men', 'auth_token_expires_at', 'timestamp null');
    $column('delivery_men', 'zone_id', 'bigint unsigned null');
    $column('delivery_men', 'availability_status', "varchar(40) not null default 'offline'");
    $column('delivery_men', 'current_latitude', 'decimal(10,7) null');
    $column('delivery_men', 'current_longitude', 'decimal(10,7) null');
    $column('delivery_men', 'last_seen_at', 'timestamp null');
    $column('medical_providers', 'zone_id', 'bigint unsigned null');
    $column('medical_providers', 'address_line', 'varchar(190) null');
    $column('medical_providers', 'floor', 'varchar(80) null');
    $column('medical_providers', 'landmark', 'varchar(190) null');
    $column('medical_providers', 'state', 'varchar(120) null');
    $column('medical_providers', 'pincode', 'varchar(20) null');
    $column('medical_providers', 'latitude', 'decimal(10,7) null');
    $column('medical_providers', 'longitude', 'decimal(10,7) null');
    $column('medical_providers', 'location_verified_at', 'timestamp null');
    $column('medical_lab_tests', 'zone_id', 'bigint unsigned null');
    $column('products', 'provider_visibility', 'tinyint(1) not null default 1');
    $column('products', 'allows_substitution', 'tinyint(1) not null default 1');
    foreach (['medical_lab_bookings', 'medical_consultations', 'medical_prescription_requests'] as $table) {
        $column($table, 'customer_id', 'bigint unsigned null after guest_id');
    }
    $column('medical_prescription_requests', 'order_id', 'bigint unsigned null');
    foreach (['medical_lab_bookings', 'medical_consultations'] as $table) {
        $column($table, 'payment_method', $mysql ? "varchar(60) not null default 'cash_on_service'" : "text not null default 'cash_on_service'");
        $column($table, 'payment_reference', $mysql ? 'varchar(255) null' : 'text');
        $column($table, 'payment_note', 'text null');
    }
    $column('support_threads', 'customer_id', 'bigint unsigned null');
    $column('payment_transactions', 'currency', "varchar(10) not null default 'INR'");
    $column('payment_transactions', 'gateway_response', 'text null');
    $column('payment_transactions', 'reconciled_at', 'timestamp null');
    $column('payment_transactions', 'reconciled_by', 'varchar(190) null');
    $db->exec("create table if not exists medical_payment_transactions (
        id bigint unsigned primary key auto_increment, entity_type varchar(30) not null,
        entity_id bigint unsigned not null, guest_id varchar(190) not null,
        payment_method varchar(60) not null default 'manual', amount decimal(12,2) not null default 0,
        currency varchar(10) not null default 'INR', reference varchar(255) null, note text null,
        status varchar(40) not null default 'pending', gateway_response text null, reconciled_at timestamp null,
        reconciled_by varchar(190) null, created_at timestamp null, updated_at timestamp null,
        unique key medical_payment_entity_unique (entity_type, entity_id), index medical_payment_guest_index (guest_id)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");
    $db->exec("create table if not exists medical_conversations (
        id bigint unsigned primary key auto_increment, customer_id bigint unsigned not null, provider_id bigint unsigned not null,
        entity_type varchar(30) not null, entity_id bigint unsigned not null, customer_last_read_at timestamp null,
        provider_last_read_at timestamp null, created_at timestamp null, updated_at timestamp null,
        unique key medical_conversations_entity_unique (entity_type, entity_id),
        index medical_conversations_customer_index (customer_id, id), index medical_conversations_provider_index (provider_id, id)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");
    $db->exec("create table if not exists medical_conversation_messages (
        id bigint unsigned primary key auto_increment, conversation_id bigint unsigned not null,
        sender_type varchar(20) not null, sender_id bigint unsigned not null, body text not null, created_at timestamp null,
        index medical_conversation_messages_cursor_index (conversation_id, id)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");
    $column('medical_payment_transactions', 'gateway_response', 'text null');
    $db->exec("create table if not exists delivery_locations (
        id bigint unsigned primary key auto_increment, delivery_man_id bigint unsigned not null,
        order_id bigint unsigned null, latitude decimal(10,7) not null, longitude decimal(10,7) not null,
        recorded_at timestamp not null, index delivery_locations_worker_index (delivery_man_id, recorded_at),
        index delivery_locations_order_index (order_id, recorded_at)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");

    $db->exec("create table if not exists device_tokens (
        id bigint unsigned primary key auto_increment, module_key varchar(40) not null default 'mart',
        owner_type varchar(40) not null default 'customer', owner_id bigint unsigned null,
        guest_id varchar(190) null, token text not null, platform varchar(40) null,
        last_seen_at timestamp null, created_at timestamp null, updated_at timestamp null,
        index device_tokens_guest_index (module_key, owner_type, guest_id),
        index device_tokens_owner_index (module_key, owner_type, owner_id)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");
    $db->exec("create table if not exists push_outbox (
        id bigint unsigned primary key auto_increment, module_key varchar(40) not null,
        recipient_type varchar(40) not null, recipient_id bigint unsigned null, guest_id varchar(190) null,
        title varchar(190) not null, message text null, data_json text null, attempts int not null default 0,
        last_error text null, sent_at timestamp null, created_at timestamp null, updated_at timestamp null,
        index push_outbox_pending_index (sent_at, attempts)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");
    $db->exec("create table if not exists payment_webhook_events (
        id bigint unsigned primary key auto_increment, module_key varchar(40) not null,
        event_key varchar(190) not null, payload_hash varchar(64) not null,
        status varchar(40) not null default 'processed', received_at timestamp null, processed_at timestamp null,
        unique key payment_webhook_events_key_unique (module_key, event_key),
        index payment_webhook_events_hash_index (payload_hash)
    ) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci");

    $db->exec("update orders set customer_id = cast(substring(guest_id, 10) as unsigned) where customer_id is null and guest_id regexp '^customer-[1-9][0-9]*$'");
    foreach (['medical_lab_bookings', 'medical_consultations', 'medical_prescription_requests'] as $table) {
        $db->exec("update `$table` set customer_id = cast(substring(guest_id, 10) as unsigned) where customer_id is null and guest_id regexp '^customer-[1-9][0-9]*$'");
    }
    foreach (['medical_lab_bookings', 'medical_consultations'] as $table) {
        $column($table, 'payment_method', "varchar(60) not null default 'cash_on_service'");
        $column($table, 'payment_reference', 'varchar(255) null');
        $column($table, 'payment_note', 'text null');
    }
};
