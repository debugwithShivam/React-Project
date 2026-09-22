import { requireRole } from './auth.middleware.js';

export const requireAdminRole = requireRole('ADMIN');
export const requireDriverRole = requireRole('DRIVER', 'ADMIN');
export const requireUserRole = requireRole('USER', 'ADMIN');
