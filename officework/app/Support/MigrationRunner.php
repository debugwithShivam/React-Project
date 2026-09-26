<?php

declare(strict_types=1);

namespace App\Support;

use PDO;
use RuntimeException;

final class MigrationRunner
{
    public function __construct(private readonly PDO $db, private readonly string $directory)
    {
    }

    public function run(): array
    {
        $this->ensureTable();
        $applied = $this->db->query('select migration from schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
        $completed = [];
        foreach (self::pendingFiles($this->directory, $applied) as $file) {
            $name = basename($file);
            $this->apply($file);
            $stmt = $this->db->prepare('insert into schema_migrations (migration, applied_at) values (:migration, CURRENT_TIMESTAMP)');
            $stmt->execute(['migration' => $name]);
            $completed[] = $name;
        }
        return $completed;
    }

    public static function pendingFiles(string $directory, array $applied): array
    {
        $files = glob(rtrim($directory, '/') . '/*.{sql,php}', GLOB_BRACE) ?: [];
        sort($files, SORT_STRING);
        $done = array_fill_keys($applied, true);
        return array_values(array_filter($files, static fn (string $file): bool => !isset($done[basename($file)])));
    }

    private function ensureTable(): void
    {
        $id = $this->db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql'
            ? 'bigint unsigned primary key auto_increment'
            : 'integer primary key autoincrement';
        $this->db->exec("create table if not exists schema_migrations (id $id, migration varchar(190) not null unique, applied_at timestamp null)");
    }

    private function apply(string $file): void
    {
        if (str_ends_with($file, '.sql')) {
            $sql = file_get_contents($file);
            if ($sql === false) {
                throw new RuntimeException('Cannot read migration ' . basename($file));
            }
            $this->db->exec($sql);
            return;
        }

        $migration = require $file;
        if (!is_callable($migration)) {
            throw new RuntimeException('PHP migration must return a callable: ' . basename($file));
        }
        $migration($this->db);
    }
}
