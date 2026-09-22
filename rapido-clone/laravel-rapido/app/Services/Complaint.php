<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class Complaint
{
    public static function create(int $userId, ?int $rideId, string $subject, string $description, string $category = 'GENERAL', string $priority = 'MEDIUM'): object
    {
        if (! $subject || ! $description) {
            throw new RuntimeException('subject and description required');
        }
        $id = DB::table('complaints')->insertGetId([
            'user_id' => $userId, 'ride_id' => $rideId, 'subject' => $subject, 'description' => $description,
            'category' => $category, 'priority' => $priority, 'status' => 'OPEN', 'created_at' => now(), 'updated_at' => now(),
        ]);

        return DB::table('complaints')->where('id', $id)->first();
    }

    public static function listForUser(int $userId): array
    {
        return DB::table('complaints as c')
            ->leftJoin('rides as r', 'r.id', '=', 'c.ride_id')
            ->where('c.user_id', $userId)
            ->orderByDesc('c.created_at')
            ->get(['c.*', 'r.pickup_address', 'r.dropoff_address'])
            ->all();
    }

    public static function get(int $id): ?object
    {
        return DB::table('complaints as c')
            ->join('users as u', 'u.id', '=', 'c.user_id')
            ->where('c.id', $id)
            ->first(['c.*', 'u.name as user_name', 'u.phone as user_phone']);
    }

    public static function update(int $id, array $patch): ?object
    {
        $fields = [];
        $status = $patch['status'] ?? null;
        if ($status) {
            $fields['status'] = $status;
            if (in_array($status, ['RESOLVED', 'CLOSED'], true)) {
                $fields['resolved_at'] = now();
            }
        }
        if (isset($patch['priority'])) {
            $fields['priority'] = $patch['priority'];
        }
        if (array_key_exists('assignedTo', $patch)) {
            $fields['assigned_to'] = $patch['assignedTo'] ?: null;
        }
        if (array_key_exists('resolution', $patch)) {
            $fields['resolution'] = $patch['resolution'];
        }
        if (! $fields) {
            return self::get($id);
        }
        $fields['updated_at'] = now();
        DB::table('complaints')->where('id', $id)->update($fields);

        $updated = self::get($id);
        if ($status && $updated) {
            Notification::create(
                (int) $updated->user_id,
                'Complaint #'.$id.' — '.str_replace('_', ' ', $status),
                $patch['resolution'] ?? "Your complaint status is now {$status}.",
                'SUPPORT',
                ['complaintId' => $id, 'status' => $status]
            );
        }

        return $updated;
    }

    public static function delete(int $id): void
    {
        DB::table('complaints')->where('id', $id)->delete();
    }
}
