<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Fare
{
    private static function round2($n): float
    {
        return round((float) $n * 100) / 100;
    }

    /**
     * Calculate fare for a vehicle type + route coordinates.
     */
    public static function calculate(?string $vehicleType, $pickupLat, $pickupLng, $dropoffLat, $dropoffLng): array
    {
        $code = strtoupper((string) ($vehicleType ?: 'BIKE'));

        $vt = DB::table('vehicle_types')->where('code', $code)->where('is_active', true)->first();
        $vt = $vt ?: (object) [
            'code' => $code,
            'name' => $code,
            'base_fare' => 30,
            'per_km_fare' => 8,
            'per_min_fare' => 1.5,
            'minimum_fare' => 30,
            'commission_percent' => 15,
        ];

        $hasCoords = $pickupLat !== null && $pickupLng !== null && $dropoffLat !== null && $dropoffLng !== null;
        if ($hasCoords) {
            $straight = Geo::haversineKm((float) $pickupLat, (float) $pickupLng, (float) $dropoffLat, (float) $dropoffLng);
            $straightKm = max(0.5, Geo::roadDistanceKm($straight));
        } else {
            $straightKm = 5;
        }

        $distanceKm = round($straightKm, 2);
        $durationMin = Geo::estimateDurationMin($distanceKm, $code === 'BIKE' ? 30 : 25);

        $baseFare = (float) $vt->base_fare;
        $distanceFare = $distanceKm * (float) $vt->per_km_fare;
        $timeFare = $durationMin * (float) $vt->per_min_fare;
        $rawTotal = $baseFare + $distanceFare + $timeFare;
        $totalFare = max((float) $vt->minimum_fare, $rawTotal);

        return [
            'vehicleType' => $vt->code,
            'vehicleName' => $vt->name ?? $vt->code,
            'distanceKm' => $distanceKm,
            'durationMin' => $durationMin,
            'baseFare' => self::round2($baseFare),
            'distanceFare' => self::round2($distanceFare),
            'timeFare' => self::round2($timeFare),
            'totalFare' => self::round2($totalFare),
            'commissionPercent' => (float) $vt->commission_percent,
            'breakdown' => [
                'baseFare' => self::round2($baseFare),
                'perKm' => (float) $vt->per_km_fare,
                'perMin' => (float) $vt->per_min_fare,
                'minimumFare' => (float) $vt->minimum_fare,
            ],
        ];
    }

    public static function estimateAll($pickupLat, $pickupLng, $dropoffLat, $dropoffLng): array
    {
        $codes = DB::table('vehicle_types')->where('is_active', true)->orderBy('sort_order')->pluck('code');
        $out = [];
        foreach ($codes as $code) {
            $out[] = self::calculate($code, $pickupLat, $pickupLng, $dropoffLat, $dropoffLng);
        }

        return $out;
    }
}
