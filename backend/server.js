import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';
import { healthCheck } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => res.json({
  status: 'ok', service: 'NGO Training LMS API', version: '2.0.0',
  timestamp: new Date().toISOString(),
}));

app.get('/health', async (req, res) => {
  try {
    await healthCheck();
    res.json({ status: 'healthy', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected', error: err.message });
  }
});

app.use('/api', router);

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

app.use((err, req, res, next) => {
  console.error('System Error:', err.message);
  if (err.message?.startsWith('CORS:')) return res.status(403).json({ error: err.message });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
  });
});

app.listen(PORT, () => {
  console.log(`NGO LMS API v2 running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
