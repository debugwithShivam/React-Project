<?php

namespace App\Services;

use App\Support\Gen;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class Ride
{
    public static function getById(int $rideId): ?object
    {
        return DB::table('rides as r')
            ->join('users as u', 'u.id', '=', 'r.user_id')
            ->leftJoin('drivers as d', 'd.id', '=', 'r.driver_id')
            ->leftJoin('users as du', 'du.id', '=', 'd.user_id')
            ->where('r.id', $rideId)
            ->first([
                'r.*',
                'u.name as user_name', 'u.phone as user_phone', 'u.rating_avg as user_rating',
                'd.id as driver_id', 'd.vehicle_type as driver_vehicle_type', 'd.vehicle_model', 'd.vehicle_plate',
                'd.rating_avg as driver_rating',
                'du.name as driver_name', 'du.phone as driver_phone', 'du.profile_image as driver_image',
            ]);
    }

    public static function create(array $input): object
    {
        $est = Fare::calculate(
            $input['vehicleType'] ?? null,
            $input['pickupLat'] ?? null, $input['pickupLng'] ?? null,
            $input['dropoffLat'] ?? null, $input['dropoffLng'] ?? null
        );
        $finalEstimated = (float) ($input['estimatedFare'] ?? $est['totalFare']);

        $couponId = null;
        $discount = 0.0;
        if (! empty($input['couponCode'])) {
            $v = Coupon::validate($input['couponCode'], (int) $input['userId'], $finalEstimated, $input['vehicleType'] ?? null, 'USER');
            $couponId = $v['coupon']['id'];
            $discount = $v['discount'];
        }

        $isScheduled = ! empty($input['scheduledAt']) && strtotime($input['scheduledAt']) > time();
        $initialStatus = $isScheduled ? 'SCHEDULED' : 'SEARCHING';

        $rideId = DB::table('rides')->insertGetId([
            'user_id' => $input['userId'],
            'pickup_address' => $input['pickupAddress'],
            'pickup_lat' => $input['pickupLat'] ?? null,
            'pickup_lng' => $input['pickupLng'] ?? null,
            'dropoff_address' => $input['dropoffAddress'],
            'dropoff_lat' => $input['dropoffLat'] ?? null,
            'dropoff_lng' => $input['dropoffLng'] ?? null,
            'vehicle_type' => $input['vehicleType'],
            'status' => $initialStatus,
            'estimated_fare' => $finalEstimated,
            'distance_km' => $est['distanceKm'],
            'duration_min' => $est['durationMin'],
            'payment_method' => $input['paymentMethod'] ?? 'CASH',
            'coupon_id' => $couponId,
            'discount_amount' => $discount,
            'scheduled_at' => $input['scheduledAt'] ?? null,
            'is_scheduled' => $isScheduled,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($couponId) {
            Coupon::redeem($couponId, (int) $input['userId'], $rideId, $discount);
        }

        DB::table('ride_events')->insert([
            'ride_id' => $rideId, 'event_type' => 'CREATED',
            'payload_json' => json_encode(['initialStatus' => $initialStatus, 'estimatedFare' => $finalEstimated, 'discount' => $discount]),
            'created_at' => now(),
        ]);

        $ride = DB::table('rides')->where('id', $rideId)->first();
        // Scheduled rides are dispatched only when the scheduler promotes them.
        $ride->dispatch = $initialStatus === 'SEARCHING'
            ? Matching::dispatchRide($rideId)
            : ['notifiedDrivers' => 0, 'drivers' => []];

        return $ride;
    }

    public static function forUser(int $userId, ?string $status = null, int $limit = 50): array
    {
        return DB::table('rides as r')
            ->leftJoin('drivers as d', 'd.id', '=', 'r.driver_id')
            ->leftJoin('users as du', 'du.id', '=', 'd.user_id')
            ->where('r.user_id', $userId)
            ->when($status, fn ($q) => $q->where('r.status', $status))
            ->orderByDesc('r.created_at')->limit($limit)
            ->get([
                'r.*', 'd.vehicle_model', 'd.vehicle_plate',
                'du.name as driver_name', 'du.phone as driver_phone', 'du.profile_image as driver_image',
                'd.rating_avg as driver_rating',
            ])
            ->all();
    }

    public static function activeForUser(int $userId): ?object
    {
        return DB::table('rides')
            ->where('user_id', $userId)
            ->whereIn('status', ['SEARCHING', 'ACCEPTED', 'ARRIVING', 'STARTED'])
            ->orderByDesc('created_at')->first();
    }

    public static function activeForDriver(int $driverUserId): ?object
    {
        $d = DB::table('drivers')->where('user_id', $driverUserId)->first(['id']);
        if (! $d) {
            return null;
        }

        return DB::table('rides')
            ->where('driver_id', $d->id)
            ->whereIn('status', ['ACCEPTED', 'ARRIVING', 'STARTED'])
            ->orderByDesc('accepted_at')->first();
    }

    public static function cancel(int $rideId, int $userId, ?string $reason = null): array
    {
        $ride = self::getById($rideId);
        if (! $ride) {
            throw new RuntimeException('Ride not found');
        }
        if ((int) $ride->user_id !== $userId) {
            throw new RuntimeException('Not your ride');
        }
        if (! in_array($ride->status, ['SEARCHING', 'ACCEPTED', 'ARRIVING'], true)) {
            throw new RuntimeException("Ride cannot be cancelled in {$ride->status} state");
        }

        $charges = 0.0;
        if (in_array($ride->status, ['ACCEPTED', 'ARRIVING'], true)) {
            $freeMin = (float) Settings::get('cancellation_free_minutes', 3);
            $elapsedMin = $ride->accepted_at ? (time() - strtotime($ride->accepted_at)) / 60 : 999;
            if ($elapsedMin > $freeMin) {
                $vt = DB::table('vehicle_types')->where('code', strtoupper($ride->vehicle_type))->first(['cancellation_fee']);
                $charges = $vt ? (float) $vt->cancellation_fee : 10.0;
            }
        }

        DB::table('rides')->where('id', $rideId)->update([
            'status' => 'CANCELLED', 'cancelled_at' => now(), 'cancelled_by' => 'USER',
            'cancellation_reason' => $reason, 'cancellation_charges' => $charges, 'updated_at' => now(),
        ]);
        DB::table('ride_events')->insert([
            'ride_id' => $rideId, 'driver_id' => $ride->driver_id, 'event_type' => 'CANCELLED_BY_USER',
            'payload_json' => json_encode(['reason' => $reason, 'charges' => $charges]), 'created_at' => now(),
        ]);

        if ($ride->driver_id) {
            $d = DB::table('drivers')->where('id', $ride->driver_id)->first(['user_id']);
            if ($d) {
                Notification::create(
                    (int) $d->user_id,
                    'Ride cancelled',
                    $charges > 0 ? "Rider cancelled. ₹{$charges} will be credited to your wallet." : 'Rider cancelled this ride.',
                    'RIDE',
                    ['rideId' => $rideId]
                );
                if ($charges > 0) {
                    Wallet::adjust((int) $d->user_id, $charges, 'CREDIT', 'CANCELLATION_COMPENSATION', 'RIDE', $rideId);
                }
            }
        }

        return ['rideId' => $rideId, 'status' => 'CANCELLED', 'by' => 'USER', 'charges' => $charges];
    }

    public static function receipt(int $rideId, int $userId): array
    {
        $ride = self::getById($rideId);
        if (! $ride) {
            throw new RuntimeException('Ride not found');
        }
        if ((int) $ride->user_id !== $userId) {
            $d = DB::table('drivers')->where('id', $ride->driver_id ?: 0)->first(['user_id']);
            if (! $d || (int) $d->user_id !== $userId) {
                throw new RuntimeException('Not your ride');
            }
        }
        $payments = DB::table('payments')->where('ride_id', $rideId)->get()->all();
        $ratings = DB::table('ratings')->where('ride_id', $rideId)->get()->all();

        return ['ride' => $ride, 'payments' => $payments, 'ratings' => $ratings];
    }

    public static function contactDriver(int $rideId, int $userId): array
    {
        $ride = self::getById($rideId);
        if (! $ride || (int) $ride->user_id !== $userId) {
            throw new RuntimeException('Not your ride');
        }
        if (! $ride->driver_phone) {
            throw new RuntimeException('No driver assigned yet');
        }

        return ['driverName' => $ride->driver_name, 'driverPhone' => $ride->driver_phone];
    }

    public static function triggerSos(int $rideId, int $userId, $lat = null, $lng = null): array
    {
        $ride = self::getById($rideId);
        if (! $ride || (int) $ride->user_id !== $userId) {
            throw new RuntimeException('Not your ride');
        }
        DB::table('rides')->where('id', $rideId)->update(['is_sos' => true]);
        $sosId = DB::table('sos_alerts')->insertGetId([
            'ride_id' => $rideId, 'user_id' => $userId,
            'lat' => $lat ?? $ride->pickup_lat, 'lng' => $lng ?? $ride->pickup_lng,
            'status' => 'ACTIVE', 'created_at' => now(),
        ]);
        Notification::create($userId, 'SOS activated', 'Our safety team has been alerted and is reviewing your ride.', 'SOS', ['rideId' => $rideId, 'sosId' => $sosId]);

        return ['sosId' => $sosId];
    }

    public static function shareLink(int $rideId, int $userId): array
    {
        $ride = self::getById($rideId);
        if (! $ride || (int) $ride->user_id !== $userId) {
            throw new RuntimeException('Not your ride');
        }
        $baseUrl = env('SHARE_RIDE_BASE_URL', 'https://sawaari.example/track');

        return [
            'url' => "{$baseUrl}/{$rideId}?token=".$ride->user_id,
            'ride' => [
                'id' => $ride->id, 'pickup' => $ride->pickup_address, 'dropoff' => $ride->dropoff_address,
                'driverName' => $ride->driver_name, 'vehiclePlate' => $ride->vehicle_plate, 'status' => $ride->status,
            ],
        ];
    }

    public static function events(int $rideId): array
    {
        return DB::table('ride_events')->where('ride_id', $rideId)->orderBy('created_at')->get()->all();
    }

    public static function pay(int $rideId, int $userId, string $method): array
    {
        $ride = self::getById($rideId);
        if (! $ride) {
            throw new RuntimeException('Ride not found');
        }
        if ((int) $ride->user_id !== $userId) {
            throw new RuntimeException('Not your ride');
        }
        $amount = (float) ($ride->final_fare ?: $ride->estimated_fare) - (float) ($ride->discount_amount ?: 0);
        if ($amount <= 0) {
            return ['status' => 'NO_AMOUNT_DUE'];
        }
        if ($method === 'CASH') {
            Payment::recordCash($rideId, $userId, $amount);

            return ['status' => 'PAID', 'method' => 'CASH', 'amount' => $amount];
        }
        if ($method === 'WALLET') {
            Payment::recordWallet($rideId, $userId, $amount);

            return ['status' => 'PAID', 'method' => 'WALLET', 'amount' => $amount];
        }
        throw new RuntimeException('Use the Razorpay flow for ONLINE payments');
    }

    /**
     * Promote SCHEDULED rides whose time has arrived (call from scheduler).
     */
    public static function promoteScheduled(): int
    {
        $rides = DB::table('rides')->where('status', 'SCHEDULED')->where('scheduled_at', '<=', now())->get(['id']);
        foreach ($rides as $ride) {
            DB::table('rides')->where('id', $ride->id)->update(['status' => 'SEARCHING', 'updated_at' => now()]);
            Matching::dispatchRide((int) $ride->id);
        }

        return count($rides);
    }
}
