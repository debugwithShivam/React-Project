<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Matching
{
    private const DRIVER_LOCATION_MAX_AGE_MINUTES = 5;

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
            ->whereNotNull('d.current_lng')
            // An online switch alone is not enough: do not dispatch using an
            // old location from a captain who has lost connectivity.
            ->where('d.last_location_update', '>=', now()->subMinutes(self::DRIVER_LOCATION_MAX_AGE_MINUTES))
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

    /**
     * Persist one request notification per eligible captain. The captain app
     * can poll /notifications (or later consume these through FCM/websockets).
     */
    public static function dispatchRide(int $rideId, float $radiusKm = 5, int $limit = 10): array
    {
        $ride = DB::table('rides')->where('id', $rideId)->first();
        if (! $ride || $ride->status !== 'SEARCHING' || $ride->pickup_lat === null || $ride->pickup_lng === null) {
            return ['notifiedDrivers' => 0, 'drivers' => []];
        }

        $drivers = self::findNearbyDrivers($ride->pickup_lat, $ride->pickup_lng, $radiusKm, $ride->vehicle_type, $limit);
        foreach ($drivers as $driver) {
            $etaMinutes = Geo::estimateDurationMin((float) $driver->distanceKm);
            $payload = [
                'rideId' => $rideId,
                'pickupAddress' => $ride->pickup_address,
                'dropoffAddress' => $ride->dropoff_address,
                'pickupLat' => (float) $ride->pickup_lat,
                'pickupLng' => (float) $ride->pickup_lng,
                'dropoffLat' => $ride->dropoff_lat === null ? null : (float) $ride->dropoff_lat,
                'dropoffLng' => $ride->dropoff_lng === null ? null : (float) $ride->dropoff_lng,
                'vehicleType' => $ride->vehicle_type,
                'estimatedFare' => (float) $ride->estimated_fare,
                'distanceKm' => (float) $driver->distanceKm,
                'etaMinutes' => $etaMinutes,
                'expiresInSec' => 30,
            ];

            Notification::create((int) $driver->user_id, 'New ride request', "{$payload['distanceKm']} km away • ₹{$payload['estimatedFare']}", 'RIDE_REQUEST', $payload);
            DB::table('ride_events')->insert([
                'ride_id' => $rideId,
                'driver_id' => $driver->driver_id,
                'event_type' => 'DISPATCHED',
                'payload_json' => json_encode($payload),
                'created_at' => now(),
            ]);
        }

        return ['notifiedDrivers' => count($drivers), 'drivers' => $drivers];
    }
}
