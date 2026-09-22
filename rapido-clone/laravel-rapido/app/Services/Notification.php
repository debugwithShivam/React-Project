<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Notification
{
    public static function create(int $userId, string $title, string $body, string $type = 'GENERAL', ?array $data = null): array
    {
        $id = DB::table('notifications')->insertGetId([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'data_json' => $data ? json_encode($data) : null,
            'is_read' => false,
            'sent_at' => now(),
        ]);

        return ['id' => $id, 'userId' => $userId, 'title' => $title, 'body' => $body, 'type' => $type, 'data' => $data];
    }

    public static function listForUser(int $userId, bool $unreadOnly = false, int $limit = 50): array
    {
        $rows = DB::table('notifications')
            ->where('user_id', $userId)
            ->when($unreadOnly, fn ($q) => $q->where('is_read', false))
            ->orderByDesc('sent_at')
            ->limit($limit)
            ->get(['id', 'title', 'body', 'type', 'data_json', 'is_read', 'sent_at', 'read_at']);

        return $rows->map(function ($r) {
            $r->data = $r->data_json ? (json_decode($r->data_json, true) ?: $r->data_json) : null;

            return $r;
        })->all();
    }

    public static function markRead(int $userId, int $notificationId): void
    {
        DB::table('notifications')->where('id', $notificationId)->where('user_id', $userId)->update(['is_read' => true, 'read_at' => now()]);
    }

    public static function markAllRead(int $userId): void
    {
        DB::table('notifications')->where('user_id', $userId)->where('is_read', false)->update(['is_read' => true, 'read_at' => now()]);
    }

    public static function delete(int $userId, int $notificationId): void
    {
        DB::table('notifications')->where('id', $notificationId)->where('user_id', $userId)->delete();
    }

    public static function adminListAll(int $limit = 200, int $offset = 0): array
    {
        return DB::table('notifications as n')
            ->join('users as u', 'u.id', '=', 'n.user_id')
            ->orderByDesc('n.sent_at')
            ->limit($limit)->offset($offset)
            ->get(['n.*', 'u.name as user_name', 'u.phone as user_phone', 'u.role as user_role'])
            ->all();
    }
}
