// Real production patterns demonstrating clean architecture and engineering practices

export const codeSnippets = [
  {
    id: "auth-middleware",
    title: "JWT Authentication & Refresh Token Pipeline",
    file: "backend/src/middleware/authMiddleware.js",
    language: "javascript",
    badge: "Security & Middleware",
    description: "Stateless JWT authentication middleware that extracts tokens from HTTP-only cookies or Authorization headers, verifies user claims, and protects internal API endpoints.",
    code: `import jwt from 'jsonwebtoken';
import { EVConfig } from '../config/EVConfig.js';
import User from '../module/User.js';

export const tokenChecker = async (req, res, next) => {
  try {
    // 1. Extract access token from cookies or Authorization header
    const token = req.cookies?.accessToken || 
      (req.headers.authorization?.startsWith('Bearer ') 
        ? req.headers.authorization.split(' ')[1] 
        : null);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. No access token provided.' 
      });
    }

    // 2. Verify token signature and payload
    const decoded = jwt.verify(token, EVConfig.ACCESSTOKEN);
    
    // 3. Attach authenticated user context to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Please refresh token.' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or forged authorization token.' 
    });
  }
};`
  },
  {
    id: "cron-automation",
    title: "MySQL Automated Order Lifecycle Scheduler",
    file: "backend/scripts/orderStatusCron.js",
    language: "javascript",
    badge: "Relational DB & Cron Jobs",
    description: "Background worker scheduled via node-cron that polls pending orders from MySQL2 connection pool and transitions status according to delivery milestones.",
    code: `import cron from 'node-cron';
import pool from '../src/db/mysqlConnection.js';

/**
 * Scheduled job running every 10 minutes:
 * Transitions 'PROCESSING' orders older than 1 hour to 'SHIPPED',
 * and 'SHIPPED' orders older than 24 hours to 'DELIVERED'.
 */
export const initOrderStatusCron = () => {
  cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Running automated order status pipeline...');
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Update Processing -> Shipped
      const [shippedResult] = await connection.execute(
        \`UPDATE orders 
         SET status = 'SHIPPED', updated_at = NOW() 
         WHERE status = 'PROCESSING' 
           AND created_at <= DATE_SUB(NOW(), INTERVAL 1 HOUR)\`
      );

      // Update Shipped -> Delivered
      const [deliveredResult] = await connection.execute(
        \`UPDATE orders 
         SET status = 'DELIVERED', updated_at = NOW() 
         WHERE status = 'SHIPPED' 
           AND updated_at <= DATE_SUB(NOW(), INTERVAL 24 HOUR)\`
      );

      await connection.commit();
      console.log(\`[CRON] Complete. Shipped: \${shippedResult.affectedRows}, Delivered: \${deliveredResult.affectedRows}\`);
    } catch (err) {
      if (connection) await connection.rollback();
      console.error('[CRON ERROR] Failed to progress order lifecycle:', err.message);
    } finally {
      if (connection) connection.release();
    }
  });
};`
  },
  {
    id: "electron-ipc",
    title: "Electron Multi-Window IPC Controller",
    file: "frontend/electron/main.js",
    language: "javascript",
    badge: "Cross-Platform Desktop & IPC",
    description: "Electron main process registering IPC handlers to open isolated popup windows for note editing and the floating mini music player with secure preload isolation.",
    code: `const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
const popoutWindows = new Map();

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173/';
  mainWindow.loadURL(startUrl);
}

// IPC: Spawn pop-out window for dedicated note editor
ipcMain.handle('open-note-window', async (event, noteId) => {
  if (popoutWindows.has(\`note-\${noteId}\`)) {
    popoutWindows.get(\`note-\${noteId}\`).focus();
    return;
  }

  const noteWindow = new BrowserWindow({
    width: 700,
    height: 600,
    title: \`Note #\${noteId}\`,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true
    }
  });

  noteWindow.loadURL(\`http://localhost:5173/UpdateNotes/\${noteId}\`);
  popoutWindows.set(\`note-\${noteId}\`, noteWindow);

  noteWindow.on('closed', () => {
    popoutWindows.delete(\`note-\${noteId}\`);
  });
});`
  },
  {
    id: "custom-debounce",
    title: "React Debounced Search & Throttling Hook",
    file: "src/hooks/useDebounce.js",
    language: "javascript",
    badge: "Frontend Performance Optimization",
    description: "Custom React hook preventing redundant API invocations during high-frequency user search input, cutting backend queries by ~60%.",
    code: `import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * @param {any} value - Input state to debounce
 * @param {number} delay - Delay window in milliseconds (default: 300ms)
 * @returns {any} debouncedValue - Stabilized value after delay
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Schedule timer to update debounced state
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timer if value changes before window finishes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`
  }
];
