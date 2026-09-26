<?php

declare(strict_types=1);

namespace App\Support;

final class CustomerIdentity
{
    private static ?array $issuedGuest = null;

    public static function guestId(int $customerId): string
    {
        return 'customer-' . $customerId;
    }

    public static function bearerToken(): string
    {
        $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        return preg_match('/^Bearer\s+(.+)$/i', trim($header), $matches) === 1 ? trim($matches[1]) : '';
    }

    public static function current(string $legacyToken = ''): ?array
    {
        $bearer = self::bearerToken();
        $token = $bearer !== '' ? $bearer : trim($legacyToken);
        if ($token === '') {
            return null;
        }

        $stmt = Database::connection()->prepare('select * from customers where auth_token = :token and status = 1 limit 1');
        $stmt->execute(['token' => hash('sha256', $token)]);
        return $stmt->fetch() ?: null;
    }

    public static function requireBearer(): array
    {
        $token = self::bearerToken();
        $customer = $token === '' ? null : self::current();
        if (!$customer) {
            Response::json(['message' => 'Authenticated customer bearer token is required.'], 401);
            exit;
        }
        return $customer;
    }

    public static function credentialPresented(string $legacyToken = ''): bool
    {
        return self::bearerToken() !== '' || self::requestCredential($legacyToken) !== '';
    }

    public static function resolveGuestId(string $suppliedGuestId, string $legacyToken = ''): ?string
    {
        return self::resolve($suppliedGuestId, $legacyToken)[0];
    }

    public static function resolve(string $suppliedGuestId = '', string $legacyToken = ''): array
    {
        $customer = self::current($legacyToken);
        if ($customer) {
            return [self::guestId((int) $customer['id']), $customer];
        }

        $credential = self::requestCredential($legacyToken);
        if ($credential !== '') {
            return [self::guestIdFromCredential($credential), null];
        }

        self::$issuedGuest = self::issueGuestCredential();
        return [self::$issuedGuest['guest_id'], null];
    }

    public static function issueGuestCredential(?string $key = null): array
    {
        $guestId = 'guest-' . bin2hex(random_bytes(16));
        $signature = hash_hmac('sha256', $guestId, self::credentialKey($key));
        return ['guest_id' => $guestId, 'guest_credential' => 'guest-v1.' . $guestId . '.' . $signature];
    }

    public static function guestIdFromCredential(string $credential, ?string $key = null): ?string
    {
        if (preg_match('/^guest-v1\.(guest-[a-f0-9]{32})\.([a-f0-9]{64})$/', trim($credential), $parts) !== 1) {
            return null;
        }
        $expected = hash_hmac('sha256', $parts[1], self::credentialKey($key));
        return hash_equals($expected, $parts[2]) ? $parts[1] : null;
    }

    public static function issuedGuestCredential(): ?array
    {
        return self::$issuedGuest;
    }

    public static function owns(string $ownedGuestId, string $resolvedGuestId, bool $authenticated): bool
    {
        if ($authenticated && !preg_match('/^customer-[1-9][0-9]*$/', $resolvedGuestId)) {
            return false;
        }
        return $ownedGuestId !== '' && hash_equals($ownedGuestId, $resolvedGuestId);
    }

    private static function requestCredential(string $legacyToken): string
    {
        $token = trim($legacyToken);
        return $token !== '' ? $token : trim((string) ($_SERVER['HTTP_X_GUEST_CREDENTIAL'] ?? ''));
    }

    private static function credentialKey(?string $key): string
    {
        $key = trim($key ?? (Env::get('APP_KEY', '') ?? ''));
        if (strlen($key) < 32 || str_starts_with($key, 'REPLACE_')) {
            throw new \RuntimeException('APP_KEY must contain at least 32 random characters.');
        }
        return $key;
    }
}
