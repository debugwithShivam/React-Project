<?php

declare(strict_types=1);

namespace App\Support;

final class RefundState
{
    public static function canRequest(string $current, string $target): bool
    {
        if ($current === $target) {
            return true;
        }

        return match ($current) {
            'pending' => in_array($target, ['approved', 'rejected'], true),
            'approved', 'refund_failed' => $target === 'refunded',
            default => false,
        };
    }

    public static function creditsWallet(string $paymentMethod): bool
    {
        return $paymentMethod === 'wallet';
    }
}
