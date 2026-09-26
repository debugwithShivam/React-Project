<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use App\Support\Database;
use App\Support\FirebaseIdToken;
use App\Support\Request;
use App\Support\Response;
use App\Support\Security;
use App\Support\Settings;

final class FirebaseAuthController
{
    private const MODULE_KEY = 'medical';

    public function config(): void
    {
        $configured = trim(Settings::moduleGet(self::MODULE_KEY, 'firebase_project_id')) !== '';
        $enabled = $configured && Settings::moduleBool(self::MODULE_KEY, 'firebase_auth_enabled', true);
        Response::json(['data' => [
            'enabled' => $enabled,
            'phone_enabled' => $enabled && Settings::moduleBool(self::MODULE_KEY, 'firebase_phone_auth_enabled', true),
        ]]);
    }

    public function session(): void
    {
        if (!Settings::moduleBool(self::MODULE_KEY, 'firebase_auth_enabled', true)) {
            Response::json(['message' => 'Firebase customer sign-in is disabled.'], 503);
            return;
        }
        $idToken = trim((string) (Request::json()['id_token'] ?? ''));
        if ($idToken === '') {
            Response::json(['message' => 'Firebase ID token is required.'], 422);
            return;
        }

        try {
            $claims = FirebaseIdToken::verify($idToken, self::MODULE_KEY);
        } catch (\Throwable $error) {
            Response::json(['message' => 'Firebase sign-in could not be verified.'], 401);
            return;
        }

        $provider = (string) ($claims['firebase']['sign_in_provider'] ?? '');
        if ($provider !== 'phone') {
            Response::json(['message' => 'Only phone OTP sign-in is enabled for this app.'], 403);
            return;
        }
        if (!Settings::moduleBool(self::MODULE_KEY, 'firebase_phone_auth_enabled', true)) {
            Response::json(['message' => 'Phone OTP sign-in is disabled.'], 403);
            return;
        }

        $uid = trim((string) ($claims['sub'] ?? ''));
        $firebasePhone = trim((string) ($claims['phone_number'] ?? ''));
        $phone = $this->localPhone($firebasePhone);
        if ($uid === '' || $phone === '') {
            Response::json(['message' => 'Firebase did not provide a verified phone number.'], 422);
            return;
        }
        Security::enforceLoginThrottle('firebase-medical-customer-login', $uid);

        $this->ensureSchema();
        $db = Database::connection();
        $stmt = $db->prepare('select * from customers where firebase_uid = :uid limit 1');
        $stmt->execute(['uid' => $uid]);
        $customer = $stmt->fetch();
        if (!$customer) {
            $stmt = $db->prepare('select * from customers where phone = :local_phone or phone = :firebase_phone limit 1');
            $stmt->execute(['local_phone' => $phone, 'firebase_phone' => $firebasePhone]);
            $customer = $stmt->fetch();
        }

        $sessionToken = bin2hex(random_bytes(32));
        if ($customer) {
            if ((int) ($customer['status'] ?? 0) !== 1) {
                Response::json(['message' => 'This customer account is inactive.'], 403);
                return;
            }
            $name = trim((string) ($customer['name'] ?? '')) ?: 'AIMEDIX Customer';
            $update = $db->prepare(
                'update customers set firebase_uid=:uid,auth_provider=:provider,name=:name,
                 phone=:phone,phone_verified=1,auth_token=:token,updated_at=CURRENT_TIMESTAMP where id=:id'
            );
            $update->execute([
                'uid' => $uid,
                'provider' => 'phone',
                'name' => $name,
                'phone' => $phone,
                'token' => hash('sha256', $sessionToken),
                'id' => (int) $customer['id'],
            ]);
            $customerId = (int) $customer['id'];
        } else {
            $insert = $db->prepare(
                'insert into customers
                 (name,phone,email,password,auth_token,firebase_uid,auth_provider,
                  email_verified,phone_verified,profile_photo,status,created_at,updated_at)
                 values (:name,:phone,null,null,:token,:uid,:provider,0,1,null,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)'
            );
            $insert->execute([
                'name' => 'AIMEDIX Customer',
                'phone' => $phone,
                'token' => hash('sha256', $sessionToken),
                'uid' => $uid,
                'provider' => 'phone',
            ]);
            $customerId = (int) $db->lastInsertId();
        }

        $profile = $db->prepare('select id,name,phone,email from customers where id=:id and status=1 limit 1');
        $profile->execute(['id' => $customerId]);
        Response::json([
            'message' => 'OTP sign-in successful',
            'data' => $profile->fetch() ?: [],
            'guest_id' => 'customer-' . $customerId,
            'token' => $sessionToken,
        ]);
    }

    private function localPhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            return substr($digits, 2);
        }
        return strlen($digits) === 10 ? $digits : '';
    }

    private function ensureSchema(): void
    {
        $db = Database::connection();
        $mysql = $db->getAttribute(\PDO::ATTR_DRIVER_NAME) === 'mysql';
        $columns = [
            'firebase_uid' => $mysql ? 'varchar(128) null' : 'text',
            'auth_provider' => $mysql ? 'varchar(40) null' : 'text',
            'email_verified' => 'integer not null default 0',
            'phone_verified' => 'integer not null default 0',
            'profile_photo' => 'text null',
        ];
        foreach ($columns as $name => $type) {
            try {
                $db->query('select ' . $name . ' from customers limit 1');
            } catch (\Throwable) {
                $db->exec('alter table customers add column ' . $name . ' ' . $type);
            }
        }
        try {
            $db->exec('create unique index customers_firebase_uid_unique on customers (firebase_uid)');
        } catch (\Throwable) {
            // The index already exists, or legacy duplicates require manual review.
        }
    }
}
