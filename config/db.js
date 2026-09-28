import mongoose from 'mongoose';

let cached = globalThis.__mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  globalThis.__mongoose = cached;
}

const connectDb = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing from the environment');

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 15000, maxPoolSize: 10 })
      .then((m) => m.connection)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDb;
