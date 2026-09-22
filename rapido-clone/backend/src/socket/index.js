import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig.js';
import pool from '../config/DBconfig/database.js';

let io = null;

// driverUserId -> Set<socketId>
const driverSockets = new Map();
// userUserId  -> Set<socketId>
const userSockets = new Map();
// socketId    -> { userId, role }
const socketMeta = new Map();

export const getIo = () => io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: envConfig.CORS_ORIGINS.includes('*') ? '*' : envConfig.CORS_ORIGINS,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
    });

    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
                socket.handshake.query?.token;
            if (!token) return next(new Error('Auth token required'));

            const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN_SECRET);
            const userId = decoded.user;
            if (!userId) return next(new Error('Invalid token'));

            const [rows] = await pool.execute(
                `SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1`,
                [userId]
            );
            if (!rows.length || !rows[0].is_active) return next(new Error('User inactive or missing'));

            socket.data.userId = rows[0].id;
            socket.data.role = rows[0].role;
            next();
        } catch (e) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const { userId, role } = socket.data;
        socketMeta.set(socket.id, { userId, role });

        socket.join(`user:${userId}`);
        if (role === 'DRIVER') {
            socket.join('drivers');
            if (!driverSockets.has(userId)) driverSockets.set(userId, new Set());
            driverSockets.get(userId).add(socket.id);
        } else if (role === 'USER') {
            if (!userSockets.has(userId)) userSockets.set(userId, new Set());
            userSockets.get(userId).add(socket.id);
        } else if (role === 'ADMIN') {
            socket.join('admins');
        }

        console.log(`[socket] ${role} ${userId} connected (${socket.id})`);

        // Driver: join ride room, broadcast location, update online state.
        socket.on('driver:online', async ({ isOnline = true } = {}) => {
            await pool.execute(`UPDATE drivers SET is_online = ? WHERE user_id = ?`, [!!isOnline, userId]);
            socket.data.isOnline = !!isOnline;
            io.to('admins').emit('driver:online-change', { userId, isOnline: !!isOnline });
        });

        socket.on('driver:location', async ({ lat, lng, heading = 0, speed = 0 }) => {
            if (lat == null || lng == null) return;
            await pool.execute(
                `UPDATE drivers SET current_lat = ?, current_lng = ?, last_location_update = NOW() WHERE user_id = ?`,
                [lat, lng, userId]
            );
            // Forward to any ride rooms this driver is in (live tracking).
            for (const room of socket.rooms) {
                if (room.startsWith('ride:')) io.to(room).emit('ride:driver-location', { lat, lng, heading, speed, at: Date.now() });
            }
        });

        // User & Driver: join a ride room for live updates.
        socket.on('ride:join', ({ rideId }) => {
            if (rideId) socket.join(`ride:${rideId}`);
        });
        socket.on('ride:leave', ({ rideId }) => {
            if (rideId) socket.leave(`ride:${rideId}`);
        });

        socket.on('disconnect', async () => {
            socketMeta.delete(socket.id);
            driverSockets.get(userId)?.delete(socket.id);
            if (driverSockets.get(userId)?.size === 0) driverSockets.delete(userId);
            userSockets.get(userId)?.delete(socket.id);
            if (userSockets.get(userId)?.size === 0) userSockets.delete(userId);

            // If driver has no other sockets, mark offline.
            if (role === 'DRIVER' && !driverSockets.has(userId)) {
                await pool.execute(`UPDATE drivers SET is_online = FALSE WHERE user_id = ?`, [userId]);
            }
            console.log(`[socket] ${role} ${userId} disconnected (${socket.id})`);
        });
    });

    console.log('[socket] Socket.io attached');
    return io;
};

// ---------- helpers used by services ----------
export const emitToUser = (userId, event, payload) => io?.to(`user:${userId}`).emit(event, payload);
export const emitToRide = (rideId, event, payload) => io?.to(`ride:${rideId}`).emit(event, payload);
export const emitToAdmins = (event, payload) => io?.to('admins').emit(event, payload);
export const emitToDrivers = (event, payload) => io?.to('drivers').emit(event, payload);

export const isDriverOnline = (driverUserId) => driverSockets.has(driverUserId);

export const getOnlineDriverIds = () => Array.from(driverSockets.keys());
