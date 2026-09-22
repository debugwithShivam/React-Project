import pool from '../config/DBconfig/database.js';
import { ApiError } from '../utils/apiError.js';
import { createNotification } from './notification.service.js';

export const createComplaint = async ({ userId, rideId = null, subject, description, category = 'GENERAL', priority = 'MEDIUM' }) => {
    if (!subject || !description) throw new ApiError(400, 'subject and description required');
    const [r] = await pool.execute(
        `INSERT INTO complaints (user_id, ride_id, subject, description, category, priority)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, rideId, subject, description, category, priority]
    );
    const [rows] = await pool.execute(`SELECT * FROM complaints WHERE id = ?`, [r.insertId]);
    return rows[0];
};

export const listComplaintsForUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT c.*, r.pickup_address, r.dropoff_address FROM complaints c
         LEFT JOIN rides r ON r.id = c.ride_id
         WHERE c.user_id = ? ORDER BY c.created_at DESC`,
        [userId]
    );
    return rows;
};

export const listAllComplaints = async ({ status, limit = 200, offset = 0 } = {}) => {
    const where = status ? `WHERE c.status = ?` : '';
    const params = status ? [status, Number(limit), Number(offset)] : [Number(limit), Number(offset)];
    const [rows] = await pool.execute(
        `SELECT c.*, u.name AS user_name, u.phone AS user_phone, u.email AS user_email,
                a.name AS assigned_to_name
         FROM complaints c
         JOIN users u ON u.id = c.user_id
         LEFT JOIN users a ON a.id = c.assigned_to
         ${where}
         ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
        params
    );
    return rows;
};

export const getComplaint = async (id) => {
    const [rows] = await pool.execute(
        `SELECT c.*, u.name AS user_name, u.phone AS user_phone FROM complaints c
         JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
        [id]
    );
    return rows[0] || null;
};

export const updateComplaint = async (id, { status, priority, assignedTo, resolution }) => {
    const fields = [];
    const params = [];
    if (status) {
        fields.push('status = ?');
        params.push(status);
        if (status === 'RESOLVED' || status === 'CLOSED') {
            fields.push('resolved_at = NOW()');
        }
    }
    if (priority) {
        fields.push('priority = ?');
        params.push(priority);
    }
    if (assignedTo !== undefined) {
        fields.push('assigned_to = ?');
        params.push(assignedTo || null);
    }
    if (resolution !== undefined) {
        fields.push('resolution = ?');
        params.push(resolution);
    }
    if (!fields.length) return getComplaint(id);
    params.push(id);
    await pool.execute(`UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`, params);

    const updated = await getComplaint(id);
    if (status && updated) {
        await createNotification({
            userId: updated.user_id,
            title: `Complaint #${id} — ${status.replace(/_/g, ' ')}`,
            body: resolution || `Your complaint status is now ${status}.`,
            type: 'SUPPORT',
            data: { complaintId: id, status },
        });
    }
    return updated;
};

export const deleteComplaint = async (id) => {
    await pool.execute(`DELETE FROM complaints WHERE id = ?`, [id]);
};
