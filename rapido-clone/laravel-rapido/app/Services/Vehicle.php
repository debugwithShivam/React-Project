<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Vehicle
{
    public static function listAll(bool $includeInactive = false): array
    {
        return DB::table('vehicle_types')
            ->when(! $includeInactive, fn ($q) => $q->where('is_active', true))
            ->orderBy('sort_order')->orderBy('id')->get()->all();
    }

    public static function get($codeOrId): ?object
    {
        return DB::table('vehicle_types')
            ->where('code', strtoupper((string) $codeOrId))
            ->orWhere('id', is_numeric($codeOrId) ? (int) $codeOrId : 0)
            ->first();
    }

    public static function create(array $data): ?object
    {
        $id = DB::table('vehicle_types')->insertGetId([
            'code' => strtoupper((string) ($data['code'] ?? '')),
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'icon_url' => $data['icon_url'] ?? null,
            'capacity' => $data['capacity'] ?? 1,
            'base_fare' => $data['base_fare'] ?? 30,
            'per_km_fare' => $data['per_km_fare'] ?? 8,
            'per_min_fare' => $data['per_min_fare'] ?? 1.5,
            'minimum_fare' => $data['minimum_fare'] ?? 30,
            'cancellation_fee' => $data['cancellation_fee'] ?? 10,
            'commission_percent' => $data['commission_percent'] ?? 15,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'sort_order' => $data['sort_order'] ?? 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return self::get($id);
    }

    public static function update(int $id, array $data): ?object
    {
        $allowed = ['name', 'description', 'icon_url', 'capacity', 'base_fare', 'per_km_fare', 'per_min_fare', 'minimum_fare', 'cancellation_fee', 'commission_percent', 'is_active', 'sort_order'];
        $fields = array_intersect_key($data, array_flip($allowed));
        if (array_key_exists('is_active', $fields)) {
            $fields['is_active'] = (bool) $fields['is_active'];
        }
        if ($fields) {
            $fields['updated_at'] = now();
            DB::table('vehicle_types')->where('id', $id)->update($fields);
        }

        return self::get($id);
    }

    public static function delete(int $id): void
    {
        DB::table('vehicle_types')->where('id', $id)->delete();
    }
}
