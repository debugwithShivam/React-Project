<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class Payout
{
    public static function request(int $driverUserId, float $amount, ?string $upi): object
    {
        $driver = DB::table('drivers')->where('user_id', $driverUserId)->where('status', 'APPROVED')->first();
        if (! $driver) {
            throw new RuntimeException('Only approved drivers can request payouts');
        }
        $min = (float) Settings::get('min_payout_amount', 250);
        if ($amount < $min) {
            throw new RuntimeException("Minimum payout is ₹{$min}");
        }
        if ($amount > (float) $driver->wallet_balance) {
            throw new RuntimeException('Amount exceeds wallet balance');
        }
        $finalUpi = $upi ?: $driver->payout_upi;
        if (! $finalUpi) {
            throw new RuntimeException('UPI id required');
        }

        $id = DB::table('payouts')->insertGetId([
            'driver_id' => $driver->id, 'amount' => $amount, 'upi' => $finalUpi,
            'status' => 'REQUESTED', 'requested_at' => now(),
        ]);

        Wallet::adjust($driverUserId, $amount, 'DEBIT', 'PAYOUT_REQUEST', 'PAYOUT', $id);

        return DB::table('payouts')->where('id', $id)->first();
    }

    public static function listForDriver(int $driverUserId): array
    {
        return DB::table('payouts as p')
            ->join('drivers as d', 'd.id', '=', 'p.driver_id')
            ->where('d.user_id', $driverUserId)
            ->orderByDesc('p.requested_at')
            ->get(['p.*'])
            ->all();
    }

    public static function process(int $payoutId, string $status, int $adminId, ?string $notes = null, ?string $referenceNumber = null): object
    {
        if (! in_array($status, ['PROCESSING', 'PAID', 'REJECTED'], true)) {
            throw new RuntimeException('Invalid status');
        }
        $payout = DB::table('payouts as p')
            ->join('drivers as d', 'd.id', '=', 'p.driver_id')
            ->join('users as u', 'u.id', '=', 'd.user_id')
            ->where('p.id', $payoutId)
            ->first(['p.*', 'u.id as user_id']);
        if (! $payout) {
            throw new RuntimeException('Payout not found');
        }
        if (in_array($payout->status, ['PAID', 'REJECTED'], true)) {
            throw new RuntimeException('Payout already '.strtolower($payout->status));
        }

        DB::table('payouts')->where('id', $payoutId)->update([
            'status' => $status, 'processed_at' => now(), 'processed_by' => $adminId,
            'notes' => $notes, 'reference_number' => $referenceNumber ?: $payout->reference_number,
        ]);

        if ($status === 'REJECTED') {
            Wallet::adjust((int) $payout->user_id, (float) $payout->amount, 'CREDIT', 'PAYOUT_REJECTED_REFUND', 'PAYOUT', $payoutId);
        }

        $body = $status === 'PAID'
            ? "₹{$payout->amount} has been sent to {$payout->upi}."
            : ($status === 'REJECTED'
                ? trim("Your payout of ₹{$payout->amount} was rejected. ".($notes ?: ''))
                : "Your payout of ₹{$payout->amount} is being processed.");
        Notification::create((int) $payout->user_id, 'Payout '.strtolower($status), $body, 'PAYOUT', ['payoutId' => $payoutId, 'status' => $status]);

        return DB::table('payouts')->where('id', $payoutId)->first();
    }
}
