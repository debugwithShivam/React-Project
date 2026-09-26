<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use App\Support\Database;
use App\Support\CustomerIdentity;
use App\Support\NotificationSchema;
use App\Support\Request;
use App\Support\Response;

final class DeviceTokenController
{
    public function __construct(
        private readonly string $moduleKey = 'mart',
        private readonly array $allowedModules = [],
        private readonly ?string $authenticatedOwnerType = null,
    ) {
    }

    public function register(): void
    {
        NotificationSchema::ensure();
        $body = Request::json();
        $token = trim((string) ($body['token'] ?? ''));
        if ($token === '') { Response::json(['message' => 'Device token is required'], 422); return; }
        $identity = $this->identity($body);
        if ($identity === null) return;
        $modules = $this->requestedModules($body, $identity['owner_type']);
        $db = Database::connection();
        foreach ($modules as $module) {
            $existing = $db->prepare('select id from device_tokens where token = :token and module_key = :module_key limit 1');
            $existing->execute(['token' => $token, 'module_key' => $module]);
            $id = (int) ($existing->fetchColumn() ?: 0);
            $params = [
                'module_key' => $module,
                'owner_type' => $identity['owner_type'],
                'owner_id' => $identity['owner_id'] > 0 ? $identity['owner_id'] : null,
                'guest_id' => $identity['guest_id'] ?: null,
                'token' => $token,
                'platform' => trim((string) ($body['platform'] ?? 'android')) ?: null,
            ];
            if ($id > 0) {
                $params['id'] = $id;
                $stmt = $db->prepare('update device_tokens set owner_type = :owner_type, owner_id = :owner_id, guest_id = :guest_id, platform = :platform, last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP where id = :id');
            } else {
                $stmt = $db->prepare('insert into device_tokens (module_key, owner_type, owner_id, guest_id, token, platform, last_seen_at, created_at, updated_at) values (:module_key, :owner_type, :owner_id, :guest_id, :token, :platform, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
            }
            $stmt->execute($params);
        }
        Response::json(['message' => 'Device token saved']);
    }

    public function unregister(): void
    {
        NotificationSchema::ensure();
        $body = Request::json();
        $token = trim((string) ($body['token'] ?? ''));
        if ($token === '') { Response::json(['message' => 'Device token is required'], 422); return; }
        $identity = $this->identity($body);
        if ($identity === null) return;
        $modules = $this->requestedModules($body, $identity['owner_type']);
        $keys = [];
        $params = ['token' => $token, 'owner_type' => $identity['owner_type']];
        $where = 'token = :token and owner_type = :owner_type';
        if ($identity['owner_id'] > 0) {
            $where .= ' and owner_id = :owner_id'; $params['owner_id'] = $identity['owner_id'];
        } else {
            $where .= ' and guest_id = :guest_id'; $params['guest_id'] = $identity['guest_id'];
        }
        foreach ($modules as $i => $module) { $key = 'module_' . $i; $keys[] = ':' . $key; $params[$key] = $module; }
        $db = Database::connection();
        $db->prepare('delete from device_tokens where ' . $where . ' and module_key in (' . implode(',', $keys) . ')')->execute($params);
        Response::json(['message' => 'Device token removed']);
    }

    private function requestedModules(array $body, string $ownerType): array
    {
        $allowed = $this->allowedModules ?: [$this->moduleKey];
        $defaults = match ($ownerType) {
            'delivery_man' => ['mart', 'medical', 'ecommerce', 'restaurant', 'services', 'taxi'],
            'service_provider' => ['services'],
            'taxi_driver' => ['taxi'],
            default => [$this->moduleKey],
        };
        $requested = $body['module_keys'] ?? ($body['module_key'] ?? null);
        $requested = is_array($requested) ? $requested : [$requested];
        $modules = array_values(array_intersect($allowed, array_map('strval', $requested)));
        return $modules ?: array_values(array_intersect($allowed, $defaults));
    }

    private function identity(array $body): ?array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/Bearer\s+(.+)/i', $header, $matches)) { Response::json(['message' => 'Authentication required'], 401); return null; }
        $bearer = trim($matches[1]);
        if ($this->authenticatedOwnerType === 'provider') {
            $stmt = Database::connection()->prepare("select id from medical_providers where auth_token = :token and status = 'approved' limit 1");
            $stmt->execute(['token' => hash('sha256', $bearer)]);
            $id = (int) ($stmt->fetchColumn() ?: 0);
            if ($id > 0) return ['owner_type' => 'provider', 'owner_id' => $id, 'guest_id' => ''];
            Response::json(['message' => 'Provider authentication is invalid'], 401); return null;
        }
        if ($this->authenticatedOwnerType === 'delivery') {
            $hash = hash('sha256', $bearer);
            foreach ([['delivery_man', 'delivery_men', 'status = 1'], ['service_provider', 'service_providers', 'status = 1'], ['taxi_driver', 'taxi_drivers', "status = 'approved'"]] as [$type, $table, $status]) {
                $stmt = Database::connection()->prepare('select id from ' . $table . ' where auth_token = :token and ' . $status . ' and (auth_token_expires_at is null or auth_token_expires_at > CURRENT_TIMESTAMP) limit 1');
                $stmt->execute(['token' => $hash]); $id = (int) ($stmt->fetchColumn() ?: 0);
                if ($id > 0) return ['owner_type' => $type, 'owner_id' => $id, 'guest_id' => ''];
            }
            Response::json(['message' => 'Worker authentication is invalid'], 401); return null;
        }
        [$guestId, $customer] = CustomerIdentity::resolve(trim((string) ($body['guest_id'] ?? '')), $bearer);
        if ($guestId === null) { Response::json(['message' => 'Customer authentication is invalid'], 401); return null; }
        return ['owner_type' => 'customer', 'owner_id' => $customer ? (int) $customer['id'] : 0, 'guest_id' => $guestId];
    }
}
