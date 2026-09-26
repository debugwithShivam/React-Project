<?php

declare(strict_types=1);

namespace App\Support;

final class NotificationLog
{
    private static ?array $customerRecipient = null;

    public static function useCustomerRecipient(?int $customerId, string $guestId): void
    {
        self::$customerRecipient = [$customerId, $guestId];
    }

    public static function record(
        string $recipientType,
        ?int $recipientId,
        ?string $guestId,
        string $title,
        string $message = '',
        ?int $orderId = null,
        string $moduleKey = 'mart',
        array $data = []
    ): void {
        try {
            if ($recipientType === 'customer' && $recipientId === null && ($guestId === null || $guestId === '') && self::$customerRecipient !== null) {
                [$recipientId, $guestId] = self::$customerRecipient;
                self::$customerRecipient = null;
            }
            $db = Database::connection();
            if (!$db->inTransaction()) {
                NotificationSchema::ensure();
            }

            $stmt = $db->prepare(
                'insert into notifications (recipient_type, recipient_id, guest_id, title, message, order_id, created_at)
                 values (:recipient_type, :recipient_id, :guest_id, :title, :message, :order_id, CURRENT_TIMESTAMP)'
            );
            $stmt->execute([
                'recipient_type' => $recipientType,
                'recipient_id' => $recipientId,
                'guest_id' => $guestId === '' ? null : $guestId,
                'title' => $title,
                'message' => $message === '' ? null : $message,
                'order_id' => $orderId,
            ]);
            if ($db->inTransaction()) {
                self::queuePush($moduleKey, $recipientType, $recipientId, $guestId, $title, $message, [
                    'module_key' => $moduleKey,
                    'recipient_type' => $recipientType,
                    'order_id' => $orderId === null ? '' : (string) $orderId,
                ] + $data);
                return;
            }
            FirebasePush::sendToRecipient(
                $moduleKey,
                $recipientType,
                $recipientId,
                $guestId,
                $title,
                $message,
                [
                    'module_key' => $moduleKey,
                    'recipient_type' => $recipientType,
                    'order_id' => $orderId === null ? '' : (string) $orderId,
                ] + $data
            );
        } catch (\Throwable) {
            // Notifications must never make the main checkout/order flow fail.
        }
    }

    private static function queuePush(
        string $moduleKey,
        string $recipientType,
        ?int $recipientId,
        ?string $guestId,
        string $title,
        string $message,
        array $data
    ): void {
        $stmt = Database::connection()->prepare(
            'insert into push_outbox
             (module_key, recipient_type, recipient_id, guest_id, title, message, data_json, created_at, updated_at)
             values (:module_key, :recipient_type, :recipient_id, :guest_id, :title, :message, :data_json, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        $stmt->execute([
            'module_key' => $moduleKey,
            'recipient_type' => $recipientType,
            'recipient_id' => $recipientId,
            'guest_id' => $guestId === '' ? null : $guestId,
            'title' => $title,
            'message' => $message === '' ? null : $message,
            'data_json' => json_encode($data, JSON_UNESCAPED_SLASHES) ?: '{}',
        ]);
    }
}
