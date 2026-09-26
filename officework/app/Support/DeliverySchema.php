<?php

declare(strict_types=1);

namespace App\Support;

final class DeliverySchema
{
    public static function ensure(): void
    {
        $db = Database::connection();
        if ($db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql') {
            $db->exec(
                'create table if not exists delivery_men (
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
                    availability_status varchar(40) not null default \'offline\',
                    current_latitude decimal(10,7) null,
                    current_longitude decimal(10,7) null,
                    last_seen_at timestamp null,
                    status tinyint(1) not null default 1,
                    created_at timestamp null,
                    updated_at timestamp null,
                    index delivery_men_phone_index (phone),
                    index delivery_men_zone_index (zone_id)
                )'
            );
        } else {
            $db->exec(
                'create table if not exists delivery_men (
                    id integer primary key autoincrement,
                    name text not null,
                    phone text not null,
                    email text,
                    password text,
                    auth_token text,
                    auth_token_expires_at text,
                    zone_id integer,
                    vehicle_type text,
                    vehicle_number text,
                    availability_status text not null default "offline",
                    current_latitude real,
                    current_longitude real,
                    last_seen_at text,
                    status integer not null default 1,
                    created_at text,
                    updated_at text
                )'
            );
        }

        self::ensureColumn('orders', 'delivery_man_id', $db);
        self::ensureColumn('orders', 'delivery_assigned_at', $db, true);
        self::ensureColumn('delivery_men', 'password', $db, true);
        self::ensureColumn('delivery_men', 'auth_token', $db, true);
        self::ensureColumn('delivery_men', 'auth_token_expires_at', $db, true);
        self::ensureColumn('delivery_men', 'zone_id', $db);
        self::ensureColumn('delivery_men', 'availability_status', $db, true, '\'offline\'');
        self::ensureColumn('delivery_men', 'current_latitude', $db, true);
        self::ensureColumn('delivery_men', 'current_longitude', $db, true);
        self::ensureColumn('delivery_men', 'last_seen_at', $db, true);
        self::ensureColumn('orders', 'delivery_decision', $db, true, '\'pending\'');
        self::ensureColumn('orders', 'delivery_decision_at', $db, true);
        self::ensureColumn('orders', 'delivery_decision_note', $db, true);
        self::ensureCoordinateColumn('orders', 'delivery_latitude', $db);
        self::ensureCoordinateColumn('orders', 'delivery_longitude', $db);
        $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
        $db->exec($mysql
            ? 'create table if not exists delivery_locations (id bigint unsigned primary key auto_increment, delivery_man_id bigint unsigned not null, order_id bigint unsigned null, latitude decimal(10,7) not null, longitude decimal(10,7) not null, heading decimal(7,2) null, speed_mps decimal(8,2) null, accuracy_meters decimal(8,2) null, recorded_at timestamp not null, index delivery_locations_worker_index (delivery_man_id, recorded_at), index delivery_locations_order_index (order_id, recorded_at)) engine=InnoDB default charset=utf8mb4'
            : 'create table if not exists delivery_locations (id integer primary key autoincrement, delivery_man_id integer not null, order_id integer, latitude real not null, longitude real not null, heading real, speed_mps real, accuracy_meters real, recorded_at text not null)');
        self::ensureCoordinateColumn('delivery_locations', 'heading', $db);
        self::ensureCoordinateColumn('delivery_locations', 'speed_mps', $db);
        self::ensureCoordinateColumn('delivery_locations', 'accuracy_meters', $db);
        $db->exec($mysql
            ? 'create table if not exists delivery_route_snapshots (order_id bigint unsigned primary key, origin_latitude decimal(10,7) not null, origin_longitude decimal(10,7) not null, destination_latitude decimal(10,7) not null, destination_longitude decimal(10,7) not null, distance_meters int unsigned not null default 0, duration_seconds int unsigned not null default 0, encoded_polyline mediumtext null, route_source varchar(40) not null default \'geographic_fallback\', refreshed_at timestamp not null) engine=InnoDB default charset=utf8mb4'
            : 'create table if not exists delivery_route_snapshots (order_id integer primary key, origin_latitude real not null, origin_longitude real not null, destination_latitude real not null, destination_longitude real not null, distance_meters integer not null default 0, duration_seconds integer not null default 0, encoded_polyline text, route_source text not null default "geographic_fallback", refreshed_at text not null)');
        if (!$mysql) { $db->exec('create index if not exists delivery_locations_worker_index on delivery_locations (delivery_man_id, recorded_at)'); $db->exec('create index if not exists delivery_locations_order_index on delivery_locations (order_id, recorded_at)'); }
    }

    private static function ensureCoordinateColumn(string $table, string $column, \PDO $db): void
    {
        try {
            $db->query('select ' . $column . ' from ' . $table . ' limit 1');
        } catch (\Throwable) {
            $type = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql'
                ? 'decimal(10,7) null'
                : 'real';
            $db->exec('alter table ' . $table . ' add column ' . $column . ' ' . $type);
        }
    }

    private static function ensureColumn(string $table, string $column, \PDO $db, bool $text = false, ?string $default = null): void
    {
        try {
            $db->query('select ' . $column . ' from ' . $table . ' limit 1');
        } catch (\Throwable) {
            if ($text) {
                $type = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql' ? 'varchar(255) null' : 'text';
                if ($column === 'last_seen_at' || $column === 'delivery_assigned_at' || $column === 'auth_token_expires_at') {
                    $type = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql' ? 'timestamp null' : 'text';
                }
                if ($column === 'current_latitude' || $column === 'current_longitude') {
                    $type = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql' ? 'decimal(10,7) null' : 'real';
                }
                if ($default !== null) {
                    $type .= ' default ' . $default;
                }
            } else {
                $type = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql' ? 'bigint unsigned null' : 'integer';
            }
            $db->exec('alter table ' . $table . ' add column ' . $column . ' ' . $type);
        }
    }
}
