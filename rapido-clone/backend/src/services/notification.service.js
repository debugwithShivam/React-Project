import pool from '../config/DBconfig/database.js';
import { getIo } from '../socket/index.js';

export const createNotification = async ({ userId, title, body, type = 'GENERAL', data = null }) => {
    const [result] = await pool.execute(
        `INSERT INTO notifications (user_id, title, body, type, data_json)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, body, type, data ? JSON.stringify(data) : null]
    );

    // Best-effort realtime delivery — fails silently if socket layer not attached.
    try {
        const io = getIo();
        io?.to(`user:${userId}`).emit('notification:new', {
            id: result.insertId,
            title,
            body,
            type,
            data,
            sentAt: new Date().toISOString(),
        });
    } catch {}

    return { id: result.insertId, userId, title, body, type, data };
};

export const listNotifications = async (userId, { unreadOnly = false, limit = 50 } = {}) => {
    const [rows] = await pool.execute(
        `SELECT id, title, body, type, data_json, is_read, sent_at, read_at
         FROM notifications
         WHERE user_id = ? ${unreadOnly ? 'AND is_read = FALSE' : ''}
         ORDER BY sent_at DESC LIMIT ?`,
        [userId, Number(limit)]
    );
    return rows.map((r) => ({ ...r, data: r.data_json ? safeJson(r.data_json) : null }));
};

export const markRead = async (userId, notificationId) => {
    await pool.execute(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
    );
};

export const markAllRead = async (userId) => {
    await pool.execute(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW()
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
    );
};

export const deleteNotification = async (userId, notificationId) => {
    await pool.execute(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [
        notificationId,
        userId,
    ]);
};

export const adminBroadcast = async ({ title, body, type = 'BROADCAST', role = null }) => {
    let sql = `INSERT INTO notifications (user_id, title, body, type) SELECT id, ?, ?, ? FROM users WHERE is_active = TRUE`;
    const params = [title, body, type];
    if (role) {
        sql += ` AND role = ?`;
        params.push(role);
    }
    const [result] = await pool.execute(sql, params);
    return { sent: result.affectedRows };
};

export const adminListAll = async ({ limit = 200, offset = 0 } = {}) => {
    const [rows] = await pool.execute(
        `SELECT n.*, u.name AS user_name, u.phone AS user_phone, u.role AS user_role
         FROM notifications n JOIN users u ON u.id = n.user_id
         ORDER BY n.sent_at DESC LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
    );
    return rows;
};

const safeJson = (s) => {
    try {
        return typeof s === 'string' ? JSON.parse(s) : s;
    } catch {
        return s;
    }
};
