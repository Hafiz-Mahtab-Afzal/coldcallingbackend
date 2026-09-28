import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import leadRoutes from './routes/leadRoutes.js';

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();

app.use(cors({ origin: origins.includes('*') ? true : origins, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) =>
  res.json({ success: true, uptime: process.uptime(), db: mongoose.connection.readyState })
);
app.use('/api/leads', leadRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  console.error('Request failed:', err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

export default app;
