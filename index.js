import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDb from './config/db.js';

const PORT = Number(process.env.PORT || 5000);

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
