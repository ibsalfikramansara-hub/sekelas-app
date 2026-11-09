/**
 * Titik masuk Aplikasi Backend — SEKELAS Class App
 * Express + Prisma + CORS + JWT auth routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { error, notFound } = require('./utils/response');

// Import rute
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const kasRoutes = require('./routes/kasRoutes');
const absenRoutes = require('./routes/absenRoutes');
const poinRoutes = require('./routes/poinRoutes');
const tugasRoutes = require('./routes/tugasRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware global ---
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sekelas-api', time: new Date().toISOString() });
});

// --- API Routes ---
const API_PREFIX = '/api';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/jadwal`, jadwalRoutes);
app.use(`${API_PREFIX}/kas`, kasRoutes);
app.use(`${API_PREFIX}/absen`, absenRoutes);
app.use(`${API_PREFIX}/poin`, poinRoutes);
app.use(`${API_PREFIX}/tugas`, tugasRoutes);

// --- 404 handler ---
app.use((req, res) => {
  notFound(res, `Endpoint ${req.method} ${req.originalUrl} tidak tersedia`);
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  error(res, 'Terjadi kesalahan pada server', 500, {
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Berjalan di http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
