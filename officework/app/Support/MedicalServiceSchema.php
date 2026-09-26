<?php

declare(strict_types=1);

namespace App\Support;

final class MedicalServiceSchema
{
    public static function ensure(): void
    {
        $db = Database::connection();
        $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
        $id = $mysql ? 'bigint unsigned primary key auto_increment' : 'integer primary key autoincrement';
        $money = $mysql ? 'decimal(12,2)' : 'real';
        $time = $mysql ? 'timestamp null' : 'text null';

        $db->exec("create table if not exists medical_providers (
            id $id, provider_type varchar(30) not null, name varchar(190) not null,
            business_name varchar(190) null, phone varchar(60) not null, email varchar(190) null,
            password_hash varchar(255) null, auth_token varchar(64) null, license_number varchar(120) null,
            speciality varchar(120) null, qualification varchar(190) null, experience_years int not null default 0,
            consultation_fee $money not null default 0, service_modes varchar(120) null,
            status varchar(30) not null default 'pending', created_at $time, updated_at $time,
            unique(provider_type, phone)
        )");
        $db->exec("create table if not exists medical_lab_tests (
            id $id, provider_id bigint null, zone_id bigint null, name varchar(190) not null, code varchar(80) null,
            description text null, price $money not null default 0, preparation text null,
            report_hours int not null default 24, home_collection int not null default 1,
            status varchar(30) not null default 'active', created_at $time, updated_at $time
        )");
        $db->exec("create table if not exists medical_lab_bookings (
            id $id, test_id bigint not null, provider_id bigint null, guest_id varchar(190) not null,
            customer_name varchar(190) not null, customer_phone varchar(60) not null, address text null,
            collection_mode varchar(30) not null default 'home', scheduled_at varchar(60) not null,
            amount $money not null default 0, status varchar(30) not null default 'requested',
            payment_status varchar(30) not null default 'pending', report_url varchar(255) null,
            provider_note text null, created_at $time, updated_at $time
        )");
        $db->exec("create table if not exists medical_consultations (
            id $id, doctor_id bigint not null, guest_id varchar(190) not null,
            customer_name varchar(190) not null, customer_phone varchar(60) not null,
            reason text null, consultation_mode varchar(30) not null default 'online', scheduled_at varchar(60) not null,
            amount $money not null default 0, status varchar(30) not null default 'requested',
            payment_status varchar(30) not null default 'pending', meeting_url varchar(255) null,
            clinical_note text null, prescription_url varchar(255) null, created_at $time, updated_at $time
        )");
        $db->exec("create table if not exists medical_prescription_requests (
            id $id, pharmacy_id bigint null, guest_id varchar(190) not null,
            customer_name varchar(190) not null, customer_phone varchar(60) not null,
            file_path varchar(255) not null, note text null, substitution_preference varchar(40) not null default 'contact_me',
            status varchar(30) not null default 'pending_review', payment_status varchar(30) not null default 'not_due',
            accepted_quote_id bigint null, created_at $time, updated_at $time
        )");
        $db->exec("create table if not exists medical_prescription_quotes (
            id $id, request_id bigint not null, pharmacy_id bigint not null,
            subtotal $money not null default 0, tax_total $money not null default 0,
            delivery_fee $money not null default 0, total $money not null default 0,
            status varchar(30) not null default 'offered', note text null, expires_at varchar(60) null,
            accepted_at $time, created_at $time, updated_at $time
        )");
        $db->exec("create table if not exists medical_prescription_quote_items (
            id $id, quote_id bigint not null, medicine_name varchar(190) not null,
            pack varchar(120) null, quantity int not null default 1, unit_price $money not null default 0,
            tax_amount $money not null default 0, line_total $money not null default 0,
            substitution_for varchar(190) null, created_at $time
        )");
        $db->exec("create table if not exists medical_payment_transactions (
            id $id, entity_type varchar(30) not null, entity_id bigint not null, guest_id varchar(190) not null,
            payment_method varchar(60) not null, amount $money not null default 0, currency varchar(10) not null default 'INR',
            reference varchar(255) null, note text null, status varchar(40) not null default 'pending',
            reconciled_at $time, reconciled_by varchar(190) null, created_at $time, updated_at $time,
            unique(entity_type, entity_id)
        )");

        $providerColumns = [
            'vendor_id' => 'bigint null',
            'zone_id' => 'bigint null',
            'address' => 'text null',
            'address_line' => 'varchar(190) null',
            'floor' => 'varchar(80) null',
            'landmark' => 'varchar(190) null',
            'city' => 'varchar(120) null',
            'state' => 'varchar(120) null',
            'pincode' => 'varchar(20) null',
            'latitude' => $mysql ? 'decimal(10,7) null' : 'real',
            'longitude' => $mysql ? 'decimal(10,7) null' : 'real',
            'location_verified_at' => $time,
            'description' => 'text null',
            'opening_hours' => 'varchar(190) null',
            'profile_image' => 'varchar(255) null',
            'service_radius_km' => "$money not null default 0",
            'home_collection_fee' => "$money not null default 0",
            'default_delivery_fee' => "$money not null default 0",
            'availability_text' => 'varchar(190) null',
        ];
        foreach ($providerColumns as $column => $definition) {
            self::ensureColumn('medical_providers', $column, $definition);
        }
        self::ensureColumn('medical_prescription_requests', 'order_id', $mysql ? 'bigint unsigned null' : 'integer');
        self::ensureColumn('medical_lab_tests', 'zone_id', $mysql ? 'bigint unsigned null' : 'integer');
        foreach (['medical_lab_bookings', 'medical_consultations', 'medical_prescription_requests'] as $table) {
            self::ensureColumn($table, 'customer_id', $mysql ? 'bigint unsigned null' : 'integer');
            self::ensureColumn($table, 'zone_id', $mysql ? 'bigint unsigned null' : 'integer');
        }
        foreach (['medical_lab_bookings', 'medical_consultations'] as $table) {
            self::ensureColumn($table, 'payment_method', $mysql ? 'varchar(60) not null default \'cash_on_service\'' : 'text not null default "cash_on_service"');
            self::ensureColumn($table, 'payment_reference', $mysql ? 'varchar(255) null' : 'text');
        }
        self::ensureColumn('medical_lab_bookings', 'payment_note', $mysql ? 'text null' : 'text');
        self::ensureColumn('medical_consultations', 'payment_note', $mysql ? 'text null' : 'text');
        self::ensureColumn('medical_payment_transactions', 'gateway_response', 'text');

        $conversationIndexes = $mysql ? ', index medical_conversations_customer_index (customer_id, id), index medical_conversations_provider_index (provider_id, id)' : '';
        $messageIndex = $mysql ? ', index medical_conversation_messages_cursor_index (conversation_id, id)' : '';
        $db->exec("create table if not exists medical_conversations (
            id $id, customer_id bigint not null, provider_id bigint not null,
            entity_type varchar(30) not null, entity_id bigint not null,
            customer_last_read_at $time, provider_last_read_at $time,
            created_at $time, updated_at $time,
            unique(entity_type, entity_id)$conversationIndexes
        )");
        $db->exec("create table if not exists medical_conversation_messages (
            id $id, conversation_id bigint not null, sender_type varchar(20) not null,
            sender_id bigint not null, body text not null, created_at $time$messageIndex
        )");
        if (!$mysql) {
            $db->exec('create index if not exists medical_conversations_customer_index on medical_conversations(customer_id, id)');
            $db->exec('create index if not exists medical_conversations_provider_index on medical_conversations(provider_id, id)');
            $db->exec('create index if not exists medical_conversation_messages_cursor_index on medical_conversation_messages(conversation_id, id)');
        }

        if ((int) $db->query('select count(*) from medical_lab_tests')->fetchColumn() === 0) {
            $db->exec("insert into medical_lab_tests (name, code, description, price, preparation, report_hours, home_collection, status, created_at, updated_at) values
                ('Complete Blood Count', 'CBC', 'Common blood health screening.', 399, 'No fasting required.', 24, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('Thyroid Profile', 'THYROID', 'T3, T4 and TSH profile.', 699, 'Follow lab instructions.', 24, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                ('Diabetes Screening', 'HBA1C', 'HbA1c long-term glucose screening.', 549, 'No fasting required.', 24, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        }
    }

    private static function ensureColumn(string $table, string $column, string $definition): void
    {
        $db = Database::connection();
        $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
        if ($mysql) {
            $stmt = $db->prepare('select count(*) from information_schema.columns where table_schema = database() and table_name = :table and column_name = :column');
            $stmt->execute(['table' => $table, 'column' => $column]);
            if ((int) $stmt->fetchColumn() === 0) {
                $db->exec("alter table $table add column $column $definition");
            }
            return;
        }
        $columns = $db->query("pragma table_info($table)")->fetchAll();
        foreach ($columns as $existing) {
            if (($existing['name'] ?? '') === $column) return;
        }
        $db->exec("alter table $table add column $column $definition");
    }
}
