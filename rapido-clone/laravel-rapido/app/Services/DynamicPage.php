<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class DynamicPage
{
    public static function bySlug(string $slug): ?object
    {
        return DB::table('dynamic_pages')
            ->where('slug', $slug)->where('is_published', true)
            ->first(['slug', 'title', 'content_html', 'meta_title', 'meta_description', 'updated_at']);
    }

    public static function listAll(bool $includeUnpublished = false): array
    {
        return DB::table('dynamic_pages')
            ->when(! $includeUnpublished, fn ($q) => $q->where('is_published', true))
            ->orderBy('slug')
            ->get(['id', 'slug', 'title', 'is_published', 'updated_at'])
            ->all();
    }

    public static function adminGet(string $slugOrId): ?object
    {
        return DB::table('dynamic_pages')
            ->where('slug', $slugOrId)->orWhere('id', is_numeric($slugOrId) ? (int) $slugOrId : 0)
            ->first();
    }

    public static function upsert(array $data): ?object
    {
        if (empty($data['slug']) || empty($data['title'])) {
            throw new RuntimeException('slug and title required');
        }
        DB::table('dynamic_pages')->updateOrInsert(
            ['slug' => $data['slug']],
            [
                'title' => $data['title'],
                'content_html' => $data['content_html'] ?? '',
                'meta_title' => $data['meta_title'] ?? null,
                'meta_description' => $data['meta_description'] ?? null,
                'is_published' => (bool) ($data['is_published'] ?? true),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return self::adminGet($data['slug']);
    }

    public static function delete(int $id): void
    {
        DB::table('dynamic_pages')->where('id', $id)->delete();
    }
}
