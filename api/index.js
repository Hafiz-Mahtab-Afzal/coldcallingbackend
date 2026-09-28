import 'dotenv/config';
import app from '../app.js';
import connectDb from '../config/db.js';

export default async function handler(req, res) {
  try {
    await connectDb();
  } catch (err) {
    console.error('Database unavailable:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable' });
    return;
  }
  app(req, res);
}
