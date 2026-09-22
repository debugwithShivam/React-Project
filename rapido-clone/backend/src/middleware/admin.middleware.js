import { requireRole } from './auth.middleware.js';

export const requireAdmin = requireRole('ADMIN');
export const requireDriver = requireRole('DRIVER', 'ADMIN');
export const requireUser = requireRole('USER', 'ADMIN');
