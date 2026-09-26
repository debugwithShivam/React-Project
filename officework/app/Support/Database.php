<?php

declare(strict_types=1);

namespace App\Support;

use PDO;

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $connection = trim((string) Env::get('DB_CONNECTION', ''));
        if (!in_array($connection, ['mysql', 'sqlite'], true)) {
            throw new \RuntimeException('DB_CONNECTION must be explicitly configured as mysql or sqlite.');
        }
        if ($connection === 'mysql') {
            foreach (['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'] as $key) {
                if (trim((string) Env::get($key, '')) === '') {
                    throw new \RuntimeException($key . ' must be explicitly configured.');
                }
            }
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                Env::get('DB_HOST', ''),
                Env::get('DB_PORT', '3306'),
                Env::get('DB_DATABASE', '')
            );
            self::$pdo = new PDO($dsn, Env::get('DB_USERNAME', ''), Env::get('DB_PASSWORD', ''), self::options());
        } else {
            $database = trim((string) Env::get('DB_DATABASE', ''));
            if ($database === '') {
                throw new \RuntimeException('DB_DATABASE must be explicitly configured.');
            }
            $path = str_starts_with($database, '/') ? $database : dirname(__DIR__, 2) . '/' . $database;
            self::$pdo = new PDO('sqlite:' . $path, null, null, self::options());
        }

        return self::$pdo;
    }

    private static function options(): array
    {
        return [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
    }
}
