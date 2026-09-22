<?php

namespace App\Services;

class Geo
{
    public static function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $toRad = fn ($d) => $d * M_PI / 180;
        $R = 6371;
        $dLat = $toRad($lat2 - $lat1);
        $dLng = $toRad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos($toRad($lat1)) * cos($toRad($lat2)) * sin($dLng / 2) ** 2;

        return 2 * $R * asin(sqrt($a));
    }

    public static function roadDistanceKm(float $straightKm): float
    {
        return $straightKm * 1.3;
    }

    public static function estimateDurationMin(float $distanceKm, float $avgSpeedKmh = 25): int
    {
        return max(1, (int) round(($distanceKm / $avgSpeedKmh) * 60));
    }

    public static function boundingBox(float $lat, float $lng, float $radiusKm): array
    {
        $latDelta = $radiusKm / 111.32;
        $lngDelta = $radiusKm / (111.32 * cos($lat * M_PI / 180));

        return [
            'minLat' => $lat - $latDelta,
            'maxLat' => $lat + $latDelta,
            'minLng' => $lng - $lngDelta,
            'maxLng' => $lng + $lngDelta,
        ];
    }
}
