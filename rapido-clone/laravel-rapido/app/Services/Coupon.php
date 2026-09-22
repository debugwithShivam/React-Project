<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class Coupon
{
    private static function isValid(object $c): array
    {
        $now = now();
        if (! $c->is_active) {
            return ['ok' => false, 'reason' => 'Coupon is not active'];
        }
        if ($c->valid_from && strtotime($c->valid_from) > $now->timestamp) {
            return ['ok' => false, 'reason' => 'Coupon is not yet valid'];
        }
        if ($c->valid_until && strtotime($c->valid_until) < $now->timestamp) {
            return ['ok' => false, 'reason' => 'Coupon has expired'];
        }
        if ($c->usage_limit > 0 && $c->used_count >= $c->usage_limit) {
            return ['ok' => false, 'reason' => 'Coupon usage limit reached'];
        }

        return ['ok' => true];
    }

    public static function validate(string $code, int $userId, float $fare, ?string $vehicleType, string $role = 'USER'): array
    {
        if (! $code) {
            throw new RuntimeException('Coupon code required');
        }
        $c = DB::table('coupons')->where('code', strtoupper($code))->first();
        if (! $c) {
            throw new RuntimeException('Invalid coupon code');
        }
        $v = self::isValid($c);
        if (! $v['ok']) {
            throw new RuntimeException($v['reason']);
        }
        $roles = array_map('trim', explode(',', (string) $c->applicable_roles));
        if (! in_array($role, $roles, true)) {
            throw new RuntimeException('Coupon not applicable to your account type');
        }
        if ($c->applicable_vehicle_types) {
            $allowed = array_map(fn ($s) => strtoupper(trim($s)), explode(',', $c->applicable_vehicle_types));
            if ($vehicleType && ! in_array(strtoupper($vehicleType), $allowed, true)) {
                throw new RuntimeException("Coupon not valid for {$vehicleType}");
            }
        }
        if ($fare < (float) $c->min_fare) {
            throw new RuntimeException("Minimum fare ₹{$c->min_fare} required for this coupon");
        }
        $used = DB::table('coupon_redemptions')->where('coupon_id', $c->id)->where('user_id', $userId)->count();
        if ($used >= $c->per_user_limit) {
            throw new RuntimeException('You have already used this coupon the maximum number of times');
        }

        $discount = $c->discount_type === 'FLAT'
            ? (float) $c->discount_value
            : ($fare * (float) $c->discount_value) / 100;
        if ($c->max_discount) {
            $discount = min($discount, (float) $c->max_discount);
        }
        $discount = min($discount, $fare);
        $discount = round($discount * 100) / 100;

        return [
            'coupon' => ['id' => $c->id, 'code' => $c->code, 'description' => $c->description, 'type' => $c->discount_type],
            'discount' => $discount,
            'finalFare' => max(0, $fare - $discount),
        ];
    }

    public static function redeem(int $couponId, int $userId, int $rideId, float $discount): void
    {
        DB::transaction(function () use ($couponId, $userId, $rideId, $discount) {
            DB::table('coupon_redemptions')->insert([
                'coupon_id' => $couponId, 'user_id' => $userId, 'ride_id' => $rideId,
                'discount_amount' => $discount, 'redeemed_at' => now(),
            ]);
            DB::table('coupons')->where('id', $couponId)->increment('used_count');
        });
    }

    public static function listAll(bool $includeInactive = false): array
    {
        return DB::table('coupons')
            ->when(! $includeInactive, fn ($q) => $q->where('is_active', true))
            ->orderByDesc('valid_until')->get()->all();
    }

    public static function listForUser(int $userId, float $fare, ?string $vehicleType, string $role = 'USER'): array
    {
        $out = [];
        foreach (self::listAll() as $c) {
            if (! self::isValid($c)['ok']) {
                continue;
            }
            $roles = array_map('trim', explode(',', (string) $c->applicable_roles));
            if (! in_array($role, $roles, true)) {
                continue;
            }
            if ($c->applicable_vehicle_types) {
                $allowed = array_map(fn ($s) => strtoupper(trim($s)), explode(',', $c->applicable_vehicle_types));
                if ($vehicleType && ! in_array(strtoupper($vehicleType), $allowed, true)) {
                    continue;
                }
            }
            if ($fare < (float) $c->min_fare) {
                continue;
            }
            $used = DB::table('coupon_redemptions')->where('coupon_id', $c->id)->where('user_id', $userId)->count();
            if ($used >= $c->per_user_limit) {
                continue;
            }
            $out[] = $c;
        }

        return $out;
    }
}
