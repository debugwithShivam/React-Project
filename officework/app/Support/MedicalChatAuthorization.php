<?php

declare(strict_types=1);

namespace App\Support;

final class MedicalChatAuthorization
{
    public static function customerEntity(int $customerId, string $type, int $entityId): ?array
    {
        $db = Database::connection();
        $queries = [
            'consultation' => ['select customer_id, doctor_id provider_id from medical_consultations where id=:id and customer_id=:customer limit 1', 'doctor'],
            'lab_booking' => ['select customer_id, provider_id from medical_lab_bookings where id=:id and customer_id=:customer and provider_id is not null limit 1', 'provider'],
            'pharmacy_order' => ["select o.customer_id, p.id provider_id from orders o join medical_providers p on p.provider_type='pharmacy' and p.status='approved' and (p.vendor_id=o.vendor_id or exists (select 1 from order_items i where i.order_id=o.id and i.vendor_id=p.vendor_id)) where o.id=:id and o.customer_id=:customer and o.module_key='medical' limit 1", 'provider'],
            'prescription_request' => ["select r.customer_id, p.id provider_id from medical_prescription_requests r join medical_providers p on p.id=r.pharmacy_id and p.provider_type='pharmacy' and p.status='approved' where r.id=:id and r.customer_id=:customer limit 1", 'provider'],
        ];
        if (!isset($queries[$type])) return null;
        $stmt = $db->prepare($queries[$type][0]);
        $stmt->execute(['id' => $entityId, 'customer' => $customerId]);
        $row = $stmt->fetch() ?: null;
        return $row ? ['customer_id' => (int) $row['customer_id'], 'provider_id' => (int) $row['provider_id']] : null;
    }

    public static function providerEntity(int $providerId, string $type, int $entityId): ?array
    {
        $db = Database::connection();
        $sql = match ($type) {
            'consultation' => 'select customer_id, doctor_id provider_id from medical_consultations where id=:id and doctor_id=:provider limit 1',
            'lab_booking' => 'select customer_id, provider_id from medical_lab_bookings where id=:id and provider_id=:provider limit 1',
            'pharmacy_order' => "select o.customer_id, p.id provider_id from orders o join medical_providers p on p.provider_type='pharmacy' and p.status='approved' and (p.vendor_id=o.vendor_id or exists (select 1 from order_items i where i.order_id=o.id and i.vendor_id=p.vendor_id)) where o.id=:id and p.id=:provider and o.module_key='medical' limit 1",
            'prescription_request' => "select r.customer_id, p.id provider_id from medical_prescription_requests r join medical_providers p on p.id=r.pharmacy_id and p.provider_type='pharmacy' and p.status='approved' where r.id=:id and p.id=:provider limit 1",
            default => '',
        };
        if ($sql === '') return null;
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $entityId, 'provider' => $providerId]);
        $row = $stmt->fetch() ?: null;
        return $row ? ['customer_id' => (int) $row['customer_id'], 'provider_id' => (int) $row['provider_id']] : null;
    }
}
