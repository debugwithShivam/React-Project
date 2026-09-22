import dotenv from 'dotenv';
import http from 'http';
dotenv.config();

import app from './app.js';
import pool from './config/DBconfig/database.js';
import { initSocket } from './socket/index.js';
import { promoteScheduledRides } from './services/ride.service.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health: http://localhost:${PORT}/api/health`);
    });

    // Promote scheduled rides to SEARCHING every 30s.
    setInterval(() => {
        promoteScheduledRides().catch((e) => console.error('[scheduler]', e.message));
    }, 30_000);

    const shutdown = async (signal) => {
        console.log(`\n[${signal}] Shutting down...`);
        try {
            await pool.end();
        } catch {}
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 5000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
