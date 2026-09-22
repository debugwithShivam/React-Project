<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Settings
{
    private static ?array $cache = null;

    private static function coerce(object $row)
    {
        $v = $row->setting_value;
        switch ($row->value_type) {
            case 'NUMBER':
                return is_numeric($v) ? $v + 0 : (float) $v;
            case 'BOOLEAN':
                return $v === 'true' || $v === '1';
            case 'JSON':
                $decoded = json_decode($v, true);

                return json_last_error() === JSON_ERROR_NONE ? $decoded : $v;
            default:
                return $v;
        }
    }

    public static function all(bool $forceRefresh = false): array
    {
        if (! $forceRefresh && self::$cache !== null) {
            return self::$cache;
        }
        $rows = DB::table('settings')->get();
        $map = [];
        foreach ($rows as $r) {
            $map[$r->setting_key] = self::coerce($r);
        }
        self::$cache = $map;

        return $map;
    }

    public static function get(string $key, $fallback = null)
    {
        $all = self::all();

        return array_key_exists($key, $all) ? $all[$key] : $fallback;
    }

    public static function set(string $key, $value, ?string $valueType = null, ?string $group = null, ?string $description = null)
    {
        $serialized = is_array($value) || is_object($value) ? json_encode($value) : (is_bool($value) ? ($value ? 'true' : 'false') : (string) $value);
        $inferred = $valueType ?: (is_int($value) || is_float($value) ? 'NUMBER' : (is_bool($value) ? 'BOOLEAN' : (is_array($value) || is_object($value) ? 'JSON' : 'STRING')));

        DB::table('settings')->updateOrInsert(
            ['setting_key' => $key],
            ['setting_value' => $serialized, 'value_type' => $inferred, 'setting_group' => $group ?: 'GENERAL', 'description' => $description, 'updated_at' => now()]
        );
        self::$cache = null;

        return self::get($key);
    }

    public static function rows(): array
    {
        return DB::table('settings')->orderBy('setting_group')->orderBy('setting_key')->get()->all();
    }

    public static function delete(string $key): void
    {
        DB::table('settings')->where('setting_key', $key)->delete();
        self::$cache = null;
    }
}
