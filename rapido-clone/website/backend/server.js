/**
 * Rapido / Uber Clone Backend - Server Entry Point
 * MVC Architecture Skeleton
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Config
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const rideRoutes = require('./src/routes/rideRoutes');
const userRoutes = require('./src/routes/userRoutes');
const contentRoutes = require('./src/routes/contentRoutes');

// Middlewares
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Built-in & 3rd-party middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Rapido Clone Backend API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount MVC API routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start server (uncomment connectDB() when database is configured)
// connectDB();
app.listen(PORT, () => {
  console.log(`[Server] Rapido Clone MVC Backend running on port ${PORT}`);
});

module.exports = app;
