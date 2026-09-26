<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use App\Support\CustomerIdentity;
use App\Support\Database;
use App\Support\MedicalChatAuthorization;
use App\Support\MedicalServiceSchema;
use App\Support\NotificationLog;
use App\Support\RateLimiter;
use App\Support\Request;
use App\Support\Response;

final class MedicalChatController
{
    private const POLL_SECONDS = 5;
    private const MAX_TEXT = 4000;

    public function customer(string $action = 'list', int $id = 0): void
    {
        MedicalServiceSchema::ensure();
        $customer = CustomerIdentity::requireBearer();
        $this->handle('customer', (int) $customer['id'], $action, $id);
    }

    public function provider(string $action = 'list', int $id = 0): void
    {
        MedicalServiceSchema::ensure();
        $provider = $this->providerBearer();
        if (!$provider) return;
        $this->handle('provider', (int) $provider['id'], $action, $id);
    }

    private function handle(string $role, int $actorId, string $action, int $id): void
    {
        $db = Database::connection();
        if ($action === 'list') {
            $field = $role === 'customer' ? 'customer_id' : 'provider_id';
            $q = $db->prepare("select * from medical_conversations where $field=:actor order by id desc limit 100");
            $q->execute(['actor' => $actorId]);
            $rows = array_values(array_filter($q->fetchAll(), fn (array $row): bool => $this->entityParticipants($role, $actorId, $row) !== null));
            foreach ($rows as &$row) {
                $latest = $db->prepare('select body,created_at from medical_conversation_messages where conversation_id=:conversation order by id desc limit 1');
                $latest->execute(['conversation' => (int) $row['id']]);
                $message = $latest->fetch() ?: [];
                $row['last_message'] = (string) ($message['body'] ?? '');
                $row['last_message_at'] = $message['created_at'] ?? null;
                if ($role === 'provider') {
                    $customer = $db->prepare('select name,phone from customers where id=:id limit 1');
                    $customer->execute(['id' => (int) $row['customer_id']]);
                    $person = $customer->fetch() ?: [];
                    $row['customer_name'] = (string) ($person['name'] ?? 'Patient');
                    $row['customer_phone'] = (string) ($person['phone'] ?? '');
                    $unread = $db->prepare("select count(*) from medical_conversation_messages m join medical_conversations c on c.id=m.conversation_id where m.conversation_id=:conversation and m.sender_type='customer' and (c.provider_last_read_at is null or m.created_at>c.provider_last_read_at)");
                    $unread->execute(['conversation' => (int) $row['id']]);
                    $row['unread_count'] = (int) $unread->fetchColumn();
                }
            }
            unset($row);
            usort($rows, static fn (array $a, array $b): int => strcmp((string) ($b['last_message_at'] ?? $b['updated_at'] ?? ''), (string) ($a['last_message_at'] ?? $a['updated_at'] ?? '')));
            Response::json(['data' => $rows, 'poll_interval_seconds' => self::POLL_SECONDS]);
            return;
        }
        if ($action === 'create') {
            $body = Request::json();
            $type = trim((string) ($body['entity_type'] ?? ''));
            $entityId = (int) ($body['entity_id'] ?? 0);
            $entity = $role === 'customer'
                ? MedicalChatAuthorization::customerEntity($actorId, $type, $entityId)
                : MedicalChatAuthorization::providerEntity($actorId, $type, $entityId);
            if (!$entity) { Response::json(['message' => 'Medical entity is unavailable or not yours.'], 403); return; }
            $q = $db->prepare('select id from medical_conversations where entity_type=:type and entity_id=:entity limit 1');
            $q->execute(['type' => $type, 'entity' => $entityId]);
            if (!$q->fetch()) {
                $q = $db->prepare('insert into medical_conversations (customer_id,provider_id,entity_type,entity_id,created_at,updated_at) values (:customer,:provider,:type,:entity,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)');
                $q->execute(['customer' => $entity['customer_id'], 'provider' => $entity['provider_id'], 'type' => $type, 'entity' => $entityId]);
            }
            $this->conversation($actorId, $role, $type, $entityId);
            return;
        }
        $conversation = $this->authorizedConversation($role, $actorId, $id);
        if (!$conversation) { Response::json(['message' => 'Conversation not found.'], 404); return; }
        if ($action === 'show') { $this->conversationRow($conversation); return; }
        if ($action === 'send') {
            RateLimiter::enforceKeyLimit('medical-chat', $role . ':' . $actorId, 30, 60, 'Too many chat messages. Please try again shortly.');
            $text = trim((string) (Request::json()['text'] ?? ''));
            if ($text === '' || strlen($text) > self::MAX_TEXT) { Response::json(['message' => 'Message text must be 1-4000 characters.'], 422); return; }
            $q = $db->prepare('insert into medical_conversation_messages (conversation_id,sender_type,sender_id,body,created_at) values (:conversation,:type,:sender,:body,CURRENT_TIMESTAMP)');
            $q->execute(['conversation' => $id, 'type' => $role, 'sender' => $actorId, 'body' => $text]);
            $db->prepare('update medical_conversations set updated_at=CURRENT_TIMESTAMP where id=:id')->execute(['id' => $id]);
            NotificationLog::record($role === 'customer' ? 'provider' : 'customer', $role === 'customer' ? (int) $conversation['provider_id'] : (int) $conversation['customer_id'], $role === 'customer' ? null : CustomerIdentity::guestId((int) $conversation['customer_id']), 'New medical message', 'You have a new medical chat message.', (int) $conversation['entity_id'], 'medical');
            $this->conversationRow($conversation); return;
        }
        if ($action === 'read') {
            $column = $role === 'customer' ? 'customer_last_read_at' : 'provider_last_read_at';
            $db->prepare("update medical_conversations set $column=CURRENT_TIMESTAMP where id=:id")->execute(['id' => $id]);
            Response::json(['message' => 'Conversation marked read.', 'poll_interval_seconds' => self::POLL_SECONDS]); return;
        }
        Response::json(['message' => 'Unknown chat action.'], 404);
    }

    private function conversation(int $actorId, string $role, string $type, int $entityId): void
    {
        $field = $role === 'customer' ? 'customer_id' : 'provider_id';
        $q = Database::connection()->prepare("select * from medical_conversations where $field=:actor and entity_type=:type and entity_id=:entity limit 1");
        $q->execute(['actor' => $actorId, 'type' => $type, 'entity' => $entityId]);
        $this->conversationRow($q->fetch() ?: []); 
    }

    private function authorizedConversation(string $role, int $actorId, int $id): ?array
    {
        $q = Database::connection()->prepare('select * from medical_conversations where id=:id and ' . ($role === 'customer' ? 'customer_id' : 'provider_id') . '=:actor limit 1');
        $q->execute(['id' => $id, 'actor' => $actorId]);
        $row = $q->fetch() ?: null;
        if (!$row) return null;
        $participants = $this->entityParticipants($role, $actorId, $row);
        return $participants && $participants['customer_id'] === (int) $row['customer_id'] && $participants['provider_id'] === (int) $row['provider_id'] ? $row : null;
    }

    private function entityParticipants(string $role, int $actorId, array $row): ?array
    {
        return $role === 'customer'
            ? MedicalChatAuthorization::customerEntity($actorId, (string) $row['entity_type'], (int) $row['entity_id'])
            : MedicalChatAuthorization::providerEntity($actorId, (string) $row['entity_type'], (int) $row['entity_id']);
    }

    private function conversationRow(array $row): void
    {
        if (!$row) { Response::json(['message' => 'Conversation not found.'], 404); return; }
        $this->messages((int) $row['id'], '', 0, $row);
    }

    private function messages(int $id, string $role, int $actor, array $conversation = []): void
    {
        $after = max(0, (int) ($_GET['after_id'] ?? 0));
        $q = Database::connection()->prepare('select id,conversation_id,sender_type,sender_id,body,created_at from medical_conversation_messages where conversation_id=:conversation and id>:after order by id asc limit 100');
        $q->execute(['conversation' => $id, 'after' => $after]);
        $messages = $q->fetchAll();
        Response::json(['data' => $conversation ?: $messages, 'messages' => $conversation ? $messages : [], 'poll_interval_seconds' => self::POLL_SECONDS]);
    }

    private function providerBearer(): ?array
    {
        $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        if (preg_match('/^Bearer\s+(.+)$/i', trim($header), $m) !== 1) { Response::json(['message' => 'Provider authentication required.'], 401); return null; }
        $q = Database::connection()->prepare("select p.* from medical_providers p join zones z on z.id=p.zone_id and z.status=1 where p.auth_token=:token and p.status='approved' limit 1");
        $q->execute(['token' => hash('sha256', trim($m[1]))]);
        $row = $q->fetch();
        if (!$row) { Response::json(['message' => 'Provider authentication is invalid.'], 403); return null; }
        return $row;
    }
}
