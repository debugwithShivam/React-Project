import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';

export const getPageBySlug = async (slug) => {
    const [rows] = await pool.execute(
        `SELECT slug, title, content_html, meta_title, meta_description, updated_at
         FROM dynamic_pages WHERE slug = ? AND is_published = TRUE LIMIT 1`,
        [slug]
    );
    return rows[0] || null;
};

export const listPages = async ({ includeUnpublished = false } = {}) => {
    const [rows] = await pool.execute(
        `SELECT id, slug, title, is_published, updated_at FROM dynamic_pages
         ${includeUnpublished ? '' : 'WHERE is_published = TRUE'}
         ORDER BY slug`
    );
    return rows;
};

export const adminGetPage = async (slugOrId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM dynamic_pages WHERE slug = ? OR id = ? LIMIT 1`,
        [slugOrId, Number(slugOrId) || 0]
    );
    return rows[0] || null;
};

export const upsertPage = async ({ slug, title, content_html, meta_title = null, meta_description = null, is_published = true }) => {
    if (!slug || !title) throw new ApiError(400, 'slug and title required');
    await pool.execute(
        `INSERT INTO dynamic_pages (slug, title, content_html, meta_title, meta_description, is_published)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            content_html = VALUES(content_html),
            meta_title = VALUES(meta_title),
            meta_description = VALUES(meta_description),
            is_published = VALUES(is_published)`,
        [slug, title, content_html || '', meta_title, meta_description, !!is_published]
    );
    return adminGetPage(slug);
};

export const deletePage = async (id) => {
    await pool.execute(`DELETE FROM dynamic_pages WHERE id = ?`, [id]);
};
