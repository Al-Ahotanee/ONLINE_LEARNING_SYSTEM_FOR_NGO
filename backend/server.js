import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';
import { healthCheck } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// CORS — restrict to frontend origin in production
// ==========================================
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// ==========================================
// Root health route — fixes "Cannot GET /"
// ==========================================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NGO Training LMS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// Deep health check (verifies DB connectivity)
// ==========================================
app.get('/health', async (req, res) => {
  try {
    await healthCheck();
    res.json({ status: 'healthy', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected', error: err.message });
  }
});

// ==========================================
// API Router
// ==========================================
app.use('/api', router);

// ==========================================
// 404 Catch-all for unknown routes
// ==========================================
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('System Error:', err.message);
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
  });
});

app.listen(PORT, () => {
  console.log(`NGO LMS API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
