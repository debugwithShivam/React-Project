<?php

declare(strict_types=1);
namespace App\Controllers\Api;

use App\Support\Auth;
use App\Support\CustomerIdentity;
use App\Support\Database;
use App\Support\MedicalDocumentAccess;
use App\Support\Response;
use App\Support\Upload;

final class MedicalDocumentController
{
    public function download(string $type, int $id): void
    {
        $document = $this->document($type, $id);
        if (!$document) {
            Response::json(['message' => 'Medical document not found'], 404);
            return;
        }
        if (!$this->authorized($document)) {
            Response::json(['message' => 'Medical document access denied'], 403);
            return;
        }
        $path = Upload::documentPath((string) $document['stored_path']);
        if ($path === null) {
            Response::json(['message' => 'Medical document not found'], 404);
            return;
        }

        header('Content-Type: ' . ((new \finfo(FILEINFO_MIME_TYPE))->file($path) ?: 'application/octet-stream'));
        header('Content-Disposition: attachment; filename="' . basename($path) . '"');
        header('Cache-Control: private, no-store, max-age=0');
        header('X-Content-Type-Options: nosniff');
        readfile($path);
        exit;
    }

    private function document(string $type, int $id): ?array
    {
        $queries = [
            'lab-report' => ['select report_url stored_path, guest_id, customer_id, provider_id, null vendor_id, zone_id from medical_lab_bookings where id=:id', 'report_url'],
            'prescription-request' => ['select r.file_path stored_path,r.guest_id,r.customer_id,r.pharmacy_id provider_id,p.vendor_id,p.zone_id from medical_prescription_requests r left join medical_providers p on p.id=r.pharmacy_id where r.id=:id', 'file_path'],
            'order-prescription' => ["select m.file_path stored_path,o.guest_id,o.customer_id,p.id provider_id,o.vendor_id,o.zone_id from medical_prescriptions m join orders o on o.id=m.order_id left join medical_providers p on p.vendor_id=o.vendor_id and p.provider_type='pharmacy' where m.id=:id and o.module_key='medical'", 'file_path'],
            'consultation-prescription' => ['select prescription_url stored_path,guest_id,customer_id,doctor_id provider_id,null vendor_id,zone_id from medical_consultations where id=:id', 'prescription_url'],
        ];
        if (!isset($queries[$type])) {
            return null;
        }
        $stmt = Database::connection()->prepare($queries[$type][0]);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row && trim((string) ($row['stored_path'] ?? '')) !== '' ? $row : null;
    }

    private function authorized(array $document): bool
    {
        if (Auth::check()) {
            return MedicalDocumentAccess::adminOwns(
                Auth::role(),
                Auth::isZoneScoped() ? Auth::zoneId() : null,
                (int) ($document['zone_id'] ?? 0) ?: null
            );
        }
        $customer = CustomerIdentity::current();
        if ($customer && MedicalDocumentAccess::customerOwns($document, (int) $customer['id'])) {
            return true;
        }
        $token = CustomerIdentity::bearerToken();
        if ($token === '') {
            return false;
        }
        $provider = Database::connection()->prepare("select id from medical_providers where auth_token=:token and status='approved' limit 1");
        $provider->execute(['token' => hash('sha256', $token)]);
        return (int) ($provider->fetchColumn() ?: 0) === (int) ($document['provider_id'] ?? 0);
    }
}
