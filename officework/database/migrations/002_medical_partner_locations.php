<?php

declare(strict_types=1);

return static function (\PDO $db): void {
    $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
    $column = static function (string $name, string $mysqlDefinition, string $sqliteDefinition) use ($db, $mysql): void {
        if ($mysql) {
            $stmt = $db->prepare("select count(*) from information_schema.columns where table_schema=database() and table_name='medical_providers' and column_name=:column");
            $stmt->execute(['column' => $name]);
            if ((int) $stmt->fetchColumn() === 0) {
                $db->exec("alter table medical_providers add column `$name` $mysqlDefinition");
            }
            return;
        }
        foreach ($db->query('pragma table_info(medical_providers)')->fetchAll() as $existing) {
            if (($existing['name'] ?? '') === $name) return;
        }
        $db->exec("alter table medical_providers add column $name $sqliteDefinition");
    };

    $column('address_line', 'varchar(190) null', 'text');
    $column('floor', 'varchar(80) null', 'text');
    $column('landmark', 'varchar(190) null', 'text');
    $column('state', 'varchar(120) null', 'text');
    $column('pincode', 'varchar(20) null', 'text');
    $column('latitude', 'decimal(10,7) null', 'real');
    $column('longitude', 'decimal(10,7) null', 'real');
    $column('location_verified_at', 'timestamp null', 'text');
};
