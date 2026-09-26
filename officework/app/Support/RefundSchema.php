<?php

declare(strict_types=1);

namespace App\Support;

final class RefundSchema
{
    public static function ensure(): void
    {
        $db = Database::connection();
        if ($db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql') {
            $db->exec(
                'create table if not exists refund_requests (
                    id bigint unsigned primary key auto_increment,
                    order_id bigint unsigned not null,
                    order_item_id bigint unsigned null,
                    vendor_id bigint unsigned null,
                    guest_id varchar(120) null,
                    customer_id bigint unsigned null,
                    customer_name varchar(190) null,
                    customer_phone varchar(60) null,
                    amount decimal(12,2) not null default 0,
                    reason varchar(255) not null,
                    note text null,
                    admin_note text null,
                    gateway_response text null,
                    status varchar(40) not null default \'pending\',
                    refund_attempted_at timestamp null,
                    refunded_at timestamp null,
                    created_at timestamp null,
                    updated_at timestamp null,
                    index refund_requests_order_id_index (order_id),
                    index refund_requests_vendor_id_index (vendor_id)
                )'
            );
        } else {
            $db->exec(
                'create table if not exists refund_requests (
                    id integer primary key autoincrement,
                    order_id integer not null,
                    order_item_id integer,
                    vendor_id integer,
                    guest_id text,
                    customer_id integer,
                    customer_name text,
                    customer_phone text,
                    amount real not null default 0,
                    reason text not null,
                    note text,
                    admin_note text,
                    gateway_response text,
                    status text not null default "pending",
                    refund_attempted_at text,
                    refunded_at text,
                    created_at text,
                    updated_at text
                )'
            );
        }

        $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
        self::addColumnIfMissing('customer_id', $mysql ? 'bigint unsigned null' : 'integer');
        self::addColumnIfMissing('currency', $mysql ? "varchar(10) not null default 'INR'" : 'text not null default "INR"');
        self::addColumnIfMissing('gateway_response', 'text');
        self::addColumnIfMissing('refund_attempted_at', $mysql ? 'timestamp null' : 'text');
        self::addColumnIfMissing('refunded_at', $mysql ? 'timestamp null' : 'text');
    }

    private static function addColumnIfMissing(string $column, string $definition): void
    {
        $db = Database::connection();
        if ($db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql') {
            $stmt = $db->prepare('select count(*) from information_schema.columns where table_schema = database() and table_name = \'refund_requests\' and column_name = :column');
            $stmt->execute(['column' => $column]);
            if ((int) $stmt->fetchColumn() === 0) {
                $db->exec("alter table refund_requests add column $column $definition");
            }
            return;
        }
        foreach ($db->query('pragma table_info(refund_requests)')->fetchAll() as $existing) {
            if (($existing['name'] ?? '') === $column) {
                return;
            }
        }
        $db->exec("alter table refund_requests add column $column $definition");
    }
}
