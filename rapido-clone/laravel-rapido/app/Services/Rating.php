<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class Rating
{
    public static function submit(int $rideId, int $raterId, string $raterRole, int $rating, ?string $comment = null): array
    {
        if ($rating < 1 || $rating > 5) {
            throw new RuntimeException('Rating must be an integer between 1 and 5');
        }
        $ride = DB::table('rides')->where('id', $rideId)->first();
        if (! $ride) {
            throw new RuntimeException('Ride not found');
        }
        if (! in_array($ride->status, ['COMPLETED', 'CANCELLED'], true)) {
            throw new RuntimeException('You can only rate completed or cancelled rides');
        }

        if ($raterRole === 'USER') {
            if ((int) $ride->user_id !== $raterId) {
                throw new RuntimeException('Not your ride');
            }
            if (! $ride->driver_id) {
                throw new RuntimeException('No driver was assigned to this ride');
            }
            $d = DB::table('drivers')->where('id', $ride->driver_id)->first(['user_id']);
            if (! $d) {
                throw new RuntimeException('Driver record missing');
            }
            $rateeId = (int) $d->user_id;
        } elseif ($raterRole === 'DRIVER') {
            $d = DB::table('drivers')->where('user_id', $raterId)->first(['id']);
            if (! $d || (int) $ride->driver_id !== (int) $d->id) {
                throw new RuntimeException('Not your ride');
            }
            $rateeId = (int) $ride->user_id;
        } else {
            throw new RuntimeException('Invalid rater role');
        }

        $existing = DB::table('ratings')->where('ride_id', $rideId)->where('rater_id', $raterId)->first();
        if ($existing) {
            DB::table('ratings')->where('id', $existing->id)->update(['rating' => $rating, 'comment' => $comment]);
            $id = $existing->id;
        } else {
            $id = DB::table('ratings')->insertGetId([
                'ride_id' => $rideId, 'rater_id' => $raterId, 'ratee_id' => $rateeId,
                'rater_role' => $raterRole, 'rating' => $rating, 'comment' => $comment, 'created_at' => now(),
            ]);
        }

        self::recompute($rateeId);

        return ['id' => $id, 'rideId' => $rideId, 'raterId' => $raterId, 'rateeId' => $rateeId, 'rating' => $rating, 'comment' => $comment];
    }

    private static function recompute(int $userId): void
    {
        $row = DB::table('ratings')->where('ratee_id', $userId)->selectRaw('AVG(rating) avg_rating, COUNT(*) n')->first();
        $avg = number_format((float) ($row->avg_rating ?? 0), 2, '.', '');
        $n = (int) $row->n;

        $u = DB::table('users')->where('id', $userId)->first(['role']);
        if (! $u) {
            return;
        }
        DB::table('users')->where('id', $userId)->update(['rating_avg' => $avg, 'rating_count' => $n]);
        if ($u->role === 'DRIVER') {
            DB::table('drivers')->where('user_id', $userId)->update(['rating_avg' => $avg, 'rating_count' => $n]);
        }
    }

    public static function listForUser(int $userId, int $limit = 50): array
    {
        return DB::table('ratings as r')
            ->join('users as u', 'u.id', '=', 'r.rater_id')
            ->join('rides as ride', 'ride.id', '=', 'r.ride_id')
            ->where('r.ratee_id', $userId)
            ->orderByDesc('r.created_at')->limit($limit)
            ->get(['r.*', 'u.name as rater_name', 'ride.pickup_address', 'ride.dropoff_address'])
            ->all();
    }

    public static function delete(int $id): void
    {
        $row = DB::table('ratings')->where('id', $id)->first(['ratee_id']);
        DB::table('ratings')->where('id', $id)->delete();
        if ($row) {
            self::recompute((int) $row->ratee_id);
        }
    }
}
