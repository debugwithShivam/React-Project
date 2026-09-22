<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class City
{
    public static function listAll(bool $includeInactive = false): array
    {
        return DB::table('cities')
            ->when(! $includeInactive, fn ($q) => $q->where('is_active', true))
            ->orderBy('name')->get()->all();
    }

    public static function create(array $data): object
    {
        $id = DB::table('cities')->insertGetId([
            'name' => $data['name'],
            'state' => $data['state'] ?? null,
            'country' => $data['country'] ?? 'India',
            'center_lat' => $data['center_lat'] ?? null,
            'center_lng' => $data['center_lng'] ?? null,
            'radius_km' => $data['radius_km'] ?? 25,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'created_at' => now(),
        ]);

        return DB::table('cities')->where('id', $id)->first();
    }

    public static function update(int $id, array $data): ?object
    {
        $allowed = ['name', 'state', 'country', 'center_lat', 'center_lng', 'radius_km', 'is_active'];
        $fields = array_intersect_key($data, array_flip($allowed));
        if (array_key_exists('is_active', $fields)) {
            $fields['is_active'] = (bool) $fields['is_active'];
        }
        if (! $fields) {
            return DB::table('cities')->where('id', $id)->first();
        }
        DB::table('cities')->where('id', $id)->update($fields);

        return DB::table('cities')->where('id', $id)->first();
    }

    public static function delete(int $id): void
    {
        DB::table('cities')->where('id', $id)->delete();
    }
}
