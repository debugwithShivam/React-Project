<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class Payment
{
    public static function isEnabled(): bool
    {
        $key = (string) env('RAZORPAY_KEY_ID', '');

        return $key !== '' && ! str_contains($key, 'REPLACE_ME');
    }

    private static function auth(): array
    {
        return [(string) env('RAZORPAY_KEY_ID'), (string) env('RAZORPAY_KEY_SECRET')];
    }

    public static function createOrder(int $userId, float $amount, string $purpose = 'RIDE', ?int $rideId = null, array $notes = []): array
    {
        if (! self::isEnabled()) {
            throw new RuntimeException('Razorpay is not configured on this server');
        }
        $amountPaise = (int) round($amount * 100);
        if ($amountPaise < 100) {
            throw new RuntimeException('Amount must be at least ₹1');
        }

        $res = Http::withBasicAuth(...self::auth())->post('https://api.razorpay.com/v1/orders', [
            'amount' => $amountPaise,
            'currency' => 'INR',
            'receipt' => 'rcpt_'.round(microtime(true) * 1000)."_{$userId}",
            'notes' => array_merge(['userId' => (string) $userId, 'purpose' => $purpose, 'rideId' => $rideId ? (string) $rideId : ''], $notes),
        ]);
        if ($res->failed()) {
            throw new RuntimeException('Razorpay order creation failed');
        }
        $order = $res->json();

        $paymentId = DB::table('payments')->insertGetId([
            'ride_id' => $rideId, 'user_id' => $userId, 'amount' => $amount,
            'method' => 'RAZORPAY', 'status' => 'INITIATED', 'gateway_order_id' => $order['id'],
            'created_at' => now(), 'updated_at' => now(),
        ]);

        return [
            'paymentId' => $paymentId,
            'orderId' => $order['id'],
            'amount' => $amount,
            'amountPaise' => $amountPaise,
            'currency' => 'INR',
            'keyId' => (string) env('RAZORPAY_KEY_ID'),
        ];
    }

    public static function verifySignature(string $orderId, string $paymentId, string $signature): bool
    {
        $expected = hash_hmac('sha256', "{$orderId}|{$paymentId}", (string) env('RAZORPAY_KEY_SECRET'));

        return hash_equals($expected, $signature);
    }

    public static function verify(int $userId, string $orderId, string $razorpayPaymentId, string $signature, bool $creditWallet = false): array
    {
        if (! self::verifySignature($orderId, $razorpayPaymentId, $signature)) {
            DB::table('payments')->where('gateway_order_id', $orderId)->update(['status' => 'FAILED', 'failure_reason' => 'Signature mismatch', 'updated_at' => now()]);
            throw new RuntimeException('Payment signature verification failed');
        }
        $payment = DB::table('payments')->where('gateway_order_id', $orderId)->where('user_id', $userId)->first();
        if (! $payment) {
            throw new RuntimeException('Payment record not found');
        }
        DB::table('payments')->where('id', $payment->id)->update([
            'status' => 'SUCCESS', 'gateway_payment_id' => $razorpayPaymentId,
            'gateway_signature' => $signature, 'paid_at' => now(), 'updated_at' => now(),
        ]);
        if ($payment->ride_id) {
            DB::table('rides')->where('id', $payment->ride_id)->update(['payment_method' => 'ONLINE', 'payment_status' => 'PAID']);
        }
        if ($creditWallet) {
            Wallet::adjust($userId, (float) $payment->amount, 'CREDIT', 'TOPUP', 'PAYMENT', (int) $payment->id);
        }

        return ['success' => true, 'paymentId' => $payment->id];
    }

    public static function recordCash(int $rideId, int $userId, float $amount): array
    {
        $id = DB::table('payments')->insertGetId([
            'ride_id' => $rideId, 'user_id' => $userId, 'amount' => $amount,
            'method' => 'CASH', 'status' => 'SUCCESS', 'paid_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('rides')->where('id', $rideId)->update(['payment_method' => 'CASH', 'payment_status' => 'PAID']);

        return ['paymentId' => $id];
    }

    public static function recordWallet(int $rideId, int $userId, float $amount): array
    {
        Wallet::adjust($userId, $amount, 'DEBIT', 'RIDE_PAYMENT', 'RIDE', $rideId);
        $id = DB::table('payments')->insertGetId([
            'ride_id' => $rideId, 'user_id' => $userId, 'amount' => $amount,
            'method' => 'WALLET', 'status' => 'SUCCESS', 'paid_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('rides')->where('id', $rideId)->update(['payment_method' => 'WALLET', 'payment_status' => 'PAID']);

        return ['paymentId' => $id];
    }

    public static function refund(int $paymentId, ?float $amount, string $reason = 'User request'): array
    {
        $payment = DB::table('payments')->where('id', $paymentId)->first();
        if (! $payment) {
            throw new RuntimeException('Payment not found');
        }
        $refundAmt = $amount ?: (float) $payment->amount;

        if ($payment->method === 'RAZORPAY' && self::isEnabled() && $payment->gateway_payment_id) {
            $res = Http::withBasicAuth(...self::auth())
                ->post("https://api.razorpay.com/v1/payments/{$payment->gateway_payment_id}/refund", [
                    'amount' => (int) round($refundAmt * 100), 'notes' => ['reason' => $reason],
                ]);
            if ($res->failed()) {
                throw new RuntimeException('Razorpay refund failed');
            }
        } elseif ($payment->method === 'WALLET') {
            Wallet::adjust((int) $payment->user_id, $refundAmt, 'CREDIT', 'REFUND', 'PAYMENT', (int) $payment->id);
        }

        DB::table('payments')->where('id', $paymentId)->update([
            'status' => 'REFUNDED', 'refund_amount' => $refundAmt, 'failure_reason' => $reason, 'updated_at' => now(),
        ]);
        if ($payment->ride_id) {
            DB::table('rides')->where('id', $payment->ride_id)->update(['payment_status' => 'REFUNDED']);
        }

        return ['success' => true, 'refundAmt' => $refundAmt];
    }

    public static function listForUser(int $userId, int $limit = 50): array
    {
        return DB::table('payments as p')
            ->leftJoin('rides as r', 'r.id', '=', 'p.ride_id')
            ->where('p.user_id', $userId)
            ->orderByDesc('p.created_at')->limit($limit)
            ->get(['p.*', 'r.pickup_address', 'r.dropoff_address', 'r.vehicle_type', 'r.status as ride_status'])
            ->all();
    }

    public static function webhook(array $body): void
    {
        if (($body['event'] ?? null) === 'payment.captured') {
            $entity = $body['payload']['payment']['entity'] ?? null;
            if ($entity && ! empty($entity['order_id'])) {
                DB::table('payments')->where('gateway_order_id', $entity['order_id'])
                    ->update(['status' => 'SUCCESS', 'gateway_payment_id' => $entity['id'], 'paid_at' => now(), 'updated_at' => now()]);
            }
        }
    }
}
