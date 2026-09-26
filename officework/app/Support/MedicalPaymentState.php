<?php

declare(strict_types=1);

namespace App\Support;

final class MedicalPaymentState
{
    public static function reconciledStatus(string $current, string $action, string $bookingStatus): ?string
    {
        if ($action === 'pending' && in_array($current, ['pending_verification', 'payment_rejected'], true)) {
            return 'pending_verification';
        }
        if ($action === 'rejected' && in_array($current, ['pending_verification', 'refund_pending', 'refund_failed'], true)) {
            return 'payment_rejected';
        }
        if ($action === 'verified') {
            if ($current === 'unpaid' && $bookingStatus !== 'completed') {
                return null;
            }
            if (in_array($current, ['unpaid', 'pending_verification', 'payment_rejected'], true)) {
                return $bookingStatus === 'cancelled' ? 'refund_pending' : 'paid';
            }
        }

        return null;
    }

    public static function cancelledStatus(string $current): string
    {
        return in_array($current, ['paid', 'verified', 'pending_verification', 'refund_pending', 'refund_failed'], true)
            ? 'refund_pending'
            : $current;
    }
}
