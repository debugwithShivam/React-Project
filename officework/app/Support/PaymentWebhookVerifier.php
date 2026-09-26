<?php

declare(strict_types=1);

namespace App\Support;

final class PaymentWebhookVerifier
{
    public static function configurationError(bool $enabled, string $environment, string $secret, string $appEnvironment = 'production'): ?string
    {
        $paymentEnvironment = strtolower(trim($environment));
        $appEnvironment = strtolower(trim($appEnvironment));
        $production = in_array($appEnvironment, ['live', 'production', 'prod'], true);
        $livePayment = in_array($paymentEnvironment, ['live', 'production', 'prod'], true);
        if (($enabled || $production || $livePayment) && trim($secret) === '') {
            return 'Payment webhook secret is not configured';
        }
        return null;
    }

    public static function validSignature(string $payload, string $secret, string $signature): bool
    {
        $signature = trim($signature);
        if (str_starts_with(strtolower($signature), 'sha256=')) {
            $signature = substr($signature, 7);
        }
        return $secret !== '' && $signature !== '' && hash_equals(hash_hmac('sha256', $payload, $secret), $signature);
    }

    public static function validTransaction(array $payload, array $transaction, string $expectedEntity, string $expectedCurrency = 'INR'): bool
    {
        $amount = $payload['amount'] ?? $payload['transaction_amount'] ?? null;
        $currency = strtoupper(trim((string) ($payload['currency'] ?? $payload['currency_code'] ?? $expectedCurrency)));
        $entity = trim((string) ($payload['entity'] ?? $payload['entity_id'] ?? $payload['order_id'] ?? $payload['booking_id'] ?? ''));
        $expectedAmount = (float) ($transaction['amount'] ?? $transaction['grand_total'] ?? $transaction['total'] ?? 0);
        return $amount !== null
            && is_numeric($amount)
            && abs((float) $amount - $expectedAmount) < 0.01
            && $currency === strtoupper(trim($expectedCurrency))
            && $entity !== ''
            && hash_equals($expectedEntity, $entity);
    }

    public static function legalTransition(string $current, string $next): bool
    {
        $current = strtolower(trim($current));
        $next = strtolower(trim($next));
        return match ($current) {
            'paid', 'verified' => in_array($next, ['paid', 'refunded'], true),
            'refunded' => $next === 'refunded',
            'failed', 'payment_rejected', 'rejected' => in_array($next, ['failed', 'payment_rejected'], true),
            default => in_array($next, ['paid', 'failed', 'payment_rejected'], true),
        };
    }
}
