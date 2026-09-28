import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDb from './config/db.js';
import leadRoutes from './routes/leadRoutes.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: ORIGINS, credentials: true }));
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

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason instanceof Error ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.stack || err.message);
});

const start = async () => {
  try {
    await connectDb();
    console.log('MongoDB connected');

    mongoose.connection.on('error', (err) => console.error('Mongo error:', err.message));
    mongoose.connection.on('disconnected', () => console.error('Mongo disconnected'));
    mongoose.connection.on('reconnected', () => console.log('Mongo reconnected'));

    app.listen(PORT, '0.0.0.0', () => console.log(`Server on http://127.0.0.1:${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.stack || err.message);
    process.exit(1);
  }
};

start();
