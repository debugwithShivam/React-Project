<?php

declare(strict_types=1);

namespace App\Support;

final class Env
{
    private static array $values = [];

    public static function get(string $key, ?string $default = null): ?string
    {
        if (self::$values === []) {
            self::load();
        }

        $environmentValue = getenv($key);
        if ($environmentValue !== false) {
            return $environmentValue;
        }

        return self::$values[$key] ?? $default;
    }

    private static function load(): void
    {
        $root = dirname(__DIR__, 2);
        // .env.local is a private development override; do not put it in production deployments.
        foreach ([$root . '/.env', $root . '/.env.local'] as $path) {
            if (!is_file($path)) {
                continue;
            }
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                    continue;
                }

                [$key, $value] = explode('=', $line, 2);
                self::$values[trim($key)] = trim(trim($value), '"\'');
            }
        }
    }
}
