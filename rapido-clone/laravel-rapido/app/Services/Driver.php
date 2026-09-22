<?php

namespace App\Services;

use App\Support\Gen;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class Driver
{
    public static function getByUserId(int $userId): ?object
    {
        return DB::table('drivers as d')
            ->join('users as u', 'u.id', '=', 'd.user_id')
            ->where('d.user_id', $userId)
            ->first([
                'd.*', 'u.name', 'u.phone', 'u.email', 'u.profile_image',
                'u.rating_avg as user_rating_avg', 'u.is_active as user_active',
            ]);
    }

    public static function toggleOnline(int $driverUserId, bool $isOnline, $lat = null, $lng = null): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver profile not found');
        }
        if ($driver->status !== 'APPROVED') {
            throw new RuntimeException('Driver account is '.strtolower($driver->status).' — cannot go online');
        }
        DB::table('drivers')->where('id', $driver->id)->update([
            'is_online' => $isOnline,
            'current_lat' => $lat ?? $driver->current_lat,
            'current_lng' => $lng ?? $driver->current_lng,
            'last_location_update' => now(),
        ]);

        return ['isOnline' => $isOnline];
    }

    public static function updateLocation(int $driverUserId, $lat, $lng): void
    {
        if ($lat === null || $lng === null) {
            throw new RuntimeException('lat,lng required');
        }
        DB::table('drivers')->where('user_id', $driverUserId)->update([
            'current_lat' => $lat, 'current_lng' => $lng, 'last_location_update' => now(),
        ]);
    }

    public static function updateProfile(int $driverUserId, array $patch): ?object
    {
        $allowed = ['payout_upi', 'vehicle_model', 'vehicle_plate', 'city'];
        $fields = array_intersect_key($patch, array_flip($allowed));
        if ($fields) {
            DB::table('drivers')->where('user_id', $driverUserId)->update($fields);
        }

        return self::getByUserId($driverUserId);
    }

    public static function uploadDocument(int $driverUserId, ?string $documentType, ?string $documentSide, $file): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver profile not found');
        }
        if (! $file) {
            throw new RuntimeException('File required');
        }
        $id = DB::table('driver_documents')->insertGetId([
            'driver_id' => $driver->id,
            'document_type' => $documentType,
            'document_side' => $documentSide,
            'file_name' => $file->getClientOriginalName(),
            'file_data' => file_get_contents($file->getRealPath()),
            'verification_status' => 'PENDING',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return ['id' => $id, 'documentType' => $documentType, 'documentSide' => $documentSide];
    }

    public static function listDocuments(int $driverUserId): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            return [];
        }

        return DB::table('driver_documents')
            ->where('driver_id', $driver->id)
            ->orderBy('document_type')->orderBy('document_side')
            ->get(['id', 'document_type', 'document_side', 'file_name', 'verification_status', 'created_at'])
            ->all();
    }

    public static function listNearbyRideRequests(int $driverUserId, float $radiusKm = 5): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver || $driver->current_lat === null) {
            return [];
        }
        $rows = DB::table('rides as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.status', 'SEARCHING')
            ->whereNull('r.driver_id')
            ->whereNotNull('r.pickup_lat')
            ->where(DB::raw('UPPER(r.vehicle_type)'), strtoupper((string) $driver->vehicle_type))
            ->orderByDesc('r.created_at')->limit(30)
            ->get(['r.*', 'u.name as user_name', 'u.phone as user_phone', 'u.rating_avg as user_rating']);

        return $rows->map(function ($r) use ($driver) {
            $r->distanceKm = round(Geo::haversineKm(
                (float) $driver->current_lat, (float) $driver->current_lng,
                (float) $r->pickup_lat, (float) $r->pickup_lng
            ), 2);

            return $r;
        })->filter(fn ($r) => $r->distanceKm <= $radiusKm)->values()->all();
    }

    public static function acceptRide(int $driverUserId, int $rideId): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver profile not found');
        }
        if ($driver->status !== 'APPROVED') {
            throw new RuntimeException('Driver not approved');
        }

        return DB::transaction(function () use ($driver, $rideId) {
            $ride = DB::table('rides')->where('id', $rideId)->where('status', 'SEARCHING')->whereNull('driver_id')->lockForUpdate()->first();
            if (! $ride) {
                throw new RuntimeException('Ride no longer available');
            }
            $otp = Gen::rideOtp();
            DB::table('rides')->where('id', $rideId)->update([
                'driver_id' => $driver->id, 'status' => 'ACCEPTED', 'accepted_at' => now(), 'start_otp' => $otp, 'updated_at' => now(),
            ]);
            DB::table('ride_events')->insert([
                'ride_id' => $rideId, 'driver_id' => $driver->id, 'event_type' => 'ACCEPTED', 'created_at' => now(),
            ]);
            Notification::create((int) $ride->user_id, 'Driver assigned', "{$driver->name} is on the way. Share OTP {$otp} to start the ride.", 'RIDE', ['rideId' => $rideId, 'driverId' => $driver->id, 'otp' => $otp]);

            return ['rideId' => $rideId, 'otp' => $otp, 'driver' => $driver];
        });
    }

    public static function rejectRide(int $driverUserId, int $rideId, ?string $reason = null): array
    {
        DB::table('ride_events')->insert([
            'ride_id' => $rideId, 'event_type' => 'REJECTED',
            'payload_json' => json_encode(['driverUserId' => $driverUserId, 'reason' => $reason]), 'created_at' => now(),
        ]);

        return ['rideId' => $rideId, 'rejected' => true];
    }

    public static function markArrived(int $driverUserId, int $rideId, $lat = null, $lng = null): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver not found');
        }
        $ride = DB::table('rides')->where('id', $rideId)->where('driver_id', $driver->id)->where('status', 'ACCEPTED')->first();
        if (! $ride) {
            throw new RuntimeException('Ride not in ACCEPTED state');
        }
        DB::table('rides')->where('id', $rideId)->update(['status' => 'ARRIVING', 'arrived_at' => now(), 'updated_at' => now()]);
        DB::table('ride_events')->insert([
            'ride_id' => $rideId, 'driver_id' => $driver->id, 'event_type' => 'ARRIVED', 'lat' => $lat, 'lng' => $lng, 'created_at' => now(),
        ]);
        Notification::create((int) $ride->user_id, 'Driver has arrived', "Your driver is at the pickup point. Share OTP {$ride->start_otp} to start.", 'RIDE', ['rideId' => $rideId]);

        return ['rideId' => $rideId, 'status' => 'ARRIVING'];
    }

    public static function startRide(int $driverUserId, int $rideId, ?string $otp): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver not found');
        }
        $ride = DB::table('rides')->where('id', $rideId)->where('driver_id', $driver->id)->whereIn('status', ['ACCEPTED', 'ARRIVING'])->first();
        if (! $ride) {
            throw new RuntimeException('Ride not in startable state');
        }
        if (! $otp || (string) $otp !== (string) $ride->start_otp) {
            throw new RuntimeException('Invalid OTP');
        }
        DB::table('rides')->where('id', $rideId)->update(['status' => 'STARTED', 'started_at' => now(), 'updated_at' => now()]);
        DB::table('ride_events')->insert([
            'ride_id' => $rideId, 'driver_id' => $driver->id, 'event_type' => 'STARTED', 'created_at' => now(),
        ]);

        return ['rideId' => $rideId, 'status' => 'STARTED', 'startedAt' => now()->toIso8601String()];
    }

    public static function completeRide(int $driverUserId, int $rideId, $finalFare = null, $distanceKm = null, $durationMin = null): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver not found');
        }

        $payload = DB::transaction(function () use ($driver, $rideId, $finalFare, $distanceKm, $durationMin) {
            $ride = DB::table('rides')->where('id', $rideId)->where('driver_id', $driver->id)->where('status', 'STARTED')->lockForUpdate()->first();
            if (! $ride) {
                throw new RuntimeException('Ride not in STARTED state');
            }

            $computedFinal = $finalFare;
            $computedDistance = $distanceKm;
            $computedDuration = $durationMin;
            if ($computedFinal === null) {
                $est = Fare::calculate($ride->vehicle_type, $ride->pickup_lat, $ride->pickup_lng, $ride->dropoff_lat, $ride->dropoff_lng);
                $computedFinal = $est['totalFare'];
                $computedDistance = $est['distanceKm'];
                $computedDuration = $est['durationMin'];
            }

            $vt = DB::table('vehicle_types')->where('code', strtoupper($ride->vehicle_type))->first(['commission_percent']);
            $commissionPercent = $vt ? (float) $vt->commission_percent : (float) Settings::get('default_commission_percent', 15);
            $commission = round((float) $computedFinal * $commissionPercent) / 100;
            $driverEarnings = (float) $computedFinal - $commission;

            DB::table('rides')->where('id', $rideId)->update([
                'status' => 'COMPLETED', 'completed_at' => now(),
                'final_fare' => $computedFinal, 'distance_km' => $computedDistance, 'duration_min' => $computedDuration,
                'commission_amount' => $commission, 'driver_earnings' => $driverEarnings, 'updated_at' => now(),
            ]);
            DB::table('ride_events')->insert([
                'ride_id' => $rideId, 'driver_id' => $driver->id, 'event_type' => 'COMPLETED', 'created_at' => now(),
            ]);
            DB::table('drivers')->where('id', $driver->id)->update([
                'total_rides' => DB::raw('total_rides + 1'),
                'total_earnings' => DB::raw("total_earnings + {$driverEarnings}"),
            ]);

            return [
                'ride' => $ride, 'driver' => $driver, 'finalFare' => (float) $computedFinal,
                'distanceKm' => (float) $computedDistance, 'durationMin' => (int) $computedDuration,
                'commission' => $commission, 'driverEarnings' => $driverEarnings,
            ];
        });

        try {
            Wallet::adjust((int) $payload['driver']->user_id, $payload['driverEarnings'], 'CREDIT', 'RIDE_EARNING', 'RIDE', $rideId);
        } catch (\Throwable $e) {
            // Wallet credit failure must not roll back the completed ride.
        }

        Notification::create((int) $payload['ride']->user_id, 'Ride completed', "Your ride ended. Fare ₹{$payload['finalFare']}. Please pay and rate your driver.", 'RIDE', ['rideId' => $rideId, 'finalFare' => $payload['finalFare']]);
        Notification::create((int) $payload['driver']->user_id, 'Ride completed', 'You earned ₹'.number_format($payload['driverEarnings'], 2).' (after ₹'.number_format($payload['commission'], 2).' commission).', 'EARNING', ['rideId' => $rideId, 'driverEarnings' => $payload['driverEarnings']]);

        return [
            'rideId' => $rideId, 'status' => 'COMPLETED', 'finalFare' => $payload['finalFare'],
            'distanceKm' => $payload['distanceKm'], 'durationMin' => $payload['durationMin'],
            'commission' => $payload['commission'], 'driverEarnings' => $payload['driverEarnings'],
        ];
    }

    public static function cancelRide(int $driverUserId, int $rideId, ?string $reason = null): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver not found');
        }
        $ride = DB::table('rides')->where('id', $rideId)->where('driver_id', $driver->id)->whereIn('status', ['ACCEPTED', 'ARRIVING', 'STARTED'])->first();
        if (! $ride) {
            throw new RuntimeException('Ride not cancellable');
        }
        DB::table('rides')->where('id', $rideId)->update([
            'status' => 'CANCELLED', 'cancelled_at' => now(), 'cancelled_by' => 'DRIVER',
            'cancellation_reason' => $reason, 'driver_id' => null, 'updated_at' => now(),
        ]);
        DB::table('ride_events')->insert([
            'ride_id' => $rideId, 'driver_id' => $driver->id, 'event_type' => 'CANCELLED_BY_DRIVER',
            'payload_json' => json_encode(['reason' => $reason]), 'created_at' => now(),
        ]);
        Notification::create((int) $ride->user_id, 'Ride cancelled by driver', $reason ?: 'The driver cancelled this ride. We are finding you a new one.', 'RIDE', ['rideId' => $rideId]);

        return ['rideId' => $rideId, 'status' => 'CANCELLED', 'by' => 'DRIVER', 'reason' => $reason];
    }

    public static function listTrips(int $driverUserId, ?string $status = null, int $limit = 50, int $offset = 0): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            return [];
        }

        return DB::table('rides as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->where('r.driver_id', $driver->id)
            ->when($status, fn ($q) => $q->where('r.status', $status))
            ->orderByDesc('r.created_at')->limit($limit)->offset($offset)
            ->get(['r.*', 'u.name as user_name', 'u.phone as user_phone', 'u.rating_avg as user_rating'])
            ->all();
    }

    public static function earnings(int $driverUserId, ?string $from = null, ?string $to = null): array
    {
        $driver = self::getByUserId($driverUserId);
        if (! $driver) {
            throw new RuntimeException('Driver not found');
        }
        $summary = DB::table('rides')
            ->where('driver_id', $driver->id)->where('status', 'COMPLETED')
            ->when($from && $to, fn ($q) => $q->whereBetween('completed_at', [$from, $to]))
            ->selectRaw('COUNT(*) rides_count, COALESCE(SUM(final_fare),0) gross, COALESCE(SUM(commission_amount),0) commission, COALESCE(SUM(driver_earnings),0) net')
            ->first();

        $daily = DB::table('rides')
            ->where('driver_id', $driver->id)->where('status', 'COMPLETED')
            ->where('completed_at', '>=', DB::raw('DATE_SUB(CURDATE(), INTERVAL 30 DAY)'))
            ->selectRaw('DATE(completed_at) day, COUNT(*) rides, COALESCE(SUM(driver_earnings),0) earnings')
            ->groupBy('day')->orderByDesc('day')->get();

        return [
            'driverId' => $driver->id,
            'walletBalance' => (float) $driver->wallet_balance,
            'totalRides' => (int) $driver->total_rides,
            'totalEarnings' => (float) $driver->total_earnings,
            'rating' => (float) $driver->rating_avg,
            'ratingCount' => (int) $driver->rating_count,
            'summary' => $summary,
            'daily' => $daily,
        ];
    }
}
