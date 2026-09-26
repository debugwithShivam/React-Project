<?php

declare(strict_types=1);

namespace App\Controllers\Api\Ecommerce;

use App\Support\Database;
use App\Support\CustomerIdentity;
use App\Support\NotificationSchema;
use App\Support\Request;
use App\Support\Response;

final class NotificationController
{
    public function index(): void
    {
        NotificationSchema::ensure();
        [$guestId] = CustomerIdentity::resolve((string) ($_GET['guest_id'] ?? ''), (string) ($_GET['customer_token'] ?? ''));
        if ($guestId === '') {
            Response::json(['data' => [], 'unread_count' => 0]);
            return;
        }

        $customer = CustomerIdentity::current();
        $stmt = Database::connection()->prepare(
            'select * from notifications where recipient_type = :type and (guest_id = :guest_id or recipient_id = :customer_id) order by id desc limit 100'
        );
        $stmt->execute(['type' => 'customer', 'guest_id' => $guestId, 'customer_id' => $customer ? (int) $customer['id'] : 0]);
        $notifications = $stmt->fetchAll();
        $count = Database::connection()->prepare(
                'select count(*) from notifications where recipient_type = :type and (guest_id = :guest_id or recipient_id = :customer_id) and read_at is null'
        );
        $count->execute(['type' => 'customer', 'guest_id' => $guestId, 'customer_id' => $customer ? (int) $customer['id'] : 0]);
        Response::json(['data' => $notifications, 'unread_count' => (int) $count->fetchColumn()]);
    }

    public function markRead(): void
    {
        NotificationSchema::ensure();
        $body = Request::json();
        [$guestId] = CustomerIdentity::resolve((string) ($body['guest_id'] ?? $_GET['guest_id'] ?? ''), (string) ($body['customer_token'] ?? ''));
        $customer = CustomerIdentity::current();
        if ($guestId !== '') {
            $stmt = Database::connection()->prepare(
                'update notifications set read_at = CURRENT_TIMESTAMP where recipient_type = :type and (guest_id = :guest_id or recipient_id = :customer_id) and read_at is null'
            );
            $stmt->execute(['type' => 'customer', 'guest_id' => $guestId, 'customer_id' => $customer ? (int) $customer['id'] : 0]);
        }
        Response::json(['message' => 'Notifications marked as read']);
    }
}
