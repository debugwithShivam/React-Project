<?php

namespace App\Services;

use App\Support\Gen;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class Wallet
{
    public static function get(int $userId): array
    {
        $row = DB::table('users')->where('id', $userId)->first(['wallet_balance']);
        if (! $row) {
            throw new RuntimeException('User not found');
        }

        return ['userId' => $userId, 'balance' => (float) $row->wallet_balance];
    }

    public static function transactions(int $userId, int $limit = 50): array
    {
        return DB::table('wallet_transactions')->where('user_id', $userId)->orderByDesc('created_at')->limit($limit)->get()->all();
    }

    /**
     * Atomically credit or debit a wallet. type: CREDIT | DEBIT.
     */
    public static function adjust(int $userId, float $amount, string $type, string $reason, ?string $referenceType = null, ?int $referenceId = null): array
    {
        if ($amount <= 0) {
            throw new RuntimeException('Amount must be greater than 0');
        }
        if (! in_array($type, ['CREDIT', 'DEBIT'], true)) {
            throw new RuntimeException('Invalid type');
        }

        return DB::transaction(function () use ($userId, $amount, $type, $reason, $referenceType, $referenceId) {
            $user = DB::table('users')->where('id', $userId)->lockForUpdate()->first(['wallet_balance', 'role']);
            if (! $user) {
                throw new RuntimeException('User not found');
            }
            $current = (float) $user->wallet_balance;
            $isDriver = $user->role === 'DRIVER';

            if ($type === 'CREDIT') {
                $newBalance = $current + $amount;
            } else {
                if ($current < $amount) {
                    throw new RuntimeException('Insufficient wallet balance');
                }
                $newBalance = $current - $amount;
            }

            DB::table('users')->where('id', $userId)->update(['wallet_balance' => $newBalance]);
            if ($isDriver) {
                DB::table('drivers')->where('user_id', $userId)->update(['wallet_balance' => $newBalance]);
            }

            $txId = DB::table('wallet_transactions')->insertGetId([
                'user_id' => $userId,
                'amount' => $amount,
                'type' => $type,
                'reason' => $reason,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'balance_after' => $newBalance,
                'created_at' => now(),
            ]);

            return ['balance' => $newBalance, 'transactionId' => $txId, 'reference' => Gen::referenceNumber('WLT')];
        });
    }

    public static function topup(int $userId, float $amount, ?int $paymentId = null): array
    {
        return self::adjust($userId, $amount, 'CREDIT', 'TOPUP', $paymentId ? 'PAYMENT' : null, $paymentId);
    }
}
