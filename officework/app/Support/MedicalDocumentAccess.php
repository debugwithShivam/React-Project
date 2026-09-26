<?php

declare(strict_types=1);

namespace App\Support;

final class MedicalDocumentAccess
{
    public static function customerOwns(array $document, int $customerId): bool
    {
        $storedCustomerId = (int) ($document['customer_id'] ?? 0);
        return $customerId > 0 && ($storedCustomerId === $customerId
            || ($storedCustomerId === 0 && hash_equals(CustomerIdentity::guestId($customerId), (string) ($document['guest_id'] ?? ''))));
    }

    public static function adminOwns(string $role, ?int $adminZoneId, ?int $documentZoneId): bool
    {
        if (!in_array($role, ['super_admin', 'medical_manager', 'zone_manager'], true)) {
            return false;
        }
        return $role !== 'zone_manager'
            || ($adminZoneId !== null && $documentZoneId !== null && $adminZoneId === $documentZoneId);
    }
}
