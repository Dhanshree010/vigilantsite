const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const violationRoutes = require('./routes/violationRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Generous payload limit to accommodate Edge Worker base64 incident frames
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'VisionOps Enterprise Backend',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'MONGODB_CONNECTED' : 'IN_MEMORY_FALLBACK'
  });
});

// Mount Routes
app.use('/api/violations', violationRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Optional MongoDB initialization
if (process.env.MONGO_URI && process.env.MONGO_URI.trim() !== '') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas cluster'))
    .catch(err => {
      console.warn('⚠️ MongoDB connection attempt failed. Operating in high-performance In-Memory Mode.');
    });
} else {
  console.log('ℹ️ Running in resilient In-Memory Store Mode (Zero MongoDB configuration required).');
}

module.exports = app;
