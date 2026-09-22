<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Matching
{
    /**
     * Find approved + online drivers near a point.
     */
    public static function findNearbyDrivers($lat, $lng, float $radiusKm = 5, ?string $vehicleType = null, int $limit = 10): array
    {
        if ($lat === null || $lng === null) {
            return [];
        }
        $box = Geo::boundingBox((float) $lat, (float) $lng, $radiusKm);

        $rows = DB::table('drivers as d')
            ->join('users as u', 'u.id', '=', 'd.user_id')
            ->leftJoin('vehicle_types as vt', 'vt.code', '=', DB::raw('UPPER(d.vehicle_type)'))
            ->where('d.status', 'APPROVED')
            ->where('u.is_active', true)
            ->where('d.is_online', true)
            ->whereNotNull('d.current_lat')
            ->whereBetween('d.current_lat', [$box['minLat'], $box['maxLat']])
            ->whereBetween('d.current_lng', [$box['minLng'], $box['maxLng']])
            ->when($vehicleType, function ($q) use ($vehicleType) {
                $code = strtoupper((string) $vehicleType);
                $q->where(function ($qq) use ($code) {
                    $qq->where(DB::raw('UPPER(d.vehicle_type)'), $code)->orWhere(DB::raw('UPPER(vt.code)'), $code);
                });
            })
            ->limit(100)
            ->get([
                'd.id as driver_id', 'd.user_id', 'd.vehicle_type', 'd.vehicle_plate', 'd.vehicle_model',
                'd.current_lat', 'd.current_lng', 'd.rating_avg',
                'u.name', 'u.phone', 'u.profile_image', 'vt.code as vt_code',
            ]);

        return $rows
            ->map(function ($r) use ($lat, $lng) {
                $r->distanceKm = round(Geo::haversineKm((float) $lat, (float) $lng, (float) $r->current_lat, (float) $r->current_lng), 2);

                return $r;
            })
            ->filter(fn ($r) => $r->distanceKm <= $radiusKm)
            ->sortBy('distanceKm')
            ->take($limit)
            ->values()
            ->all();
    }

    public static function countNearbyDrivers($lat, $lng, float $radiusKm = 5, ?string $vehicleType = null): int
    {
        return count(self::findNearbyDrivers($lat, $lng, $radiusKm, $vehicleType, 100));
    }
}
