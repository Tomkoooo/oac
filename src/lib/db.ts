import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  // Production logging
  const startTime = Date.now();
  console.log(`[DB] Connection attempt starting at ${new Date().toISOString()}`);
  console.log(`[DB] MONGODB_URI configured: ${MONGODB_URI ? 'Yes (length: ' + MONGODB_URI.length + ')' : 'NO - MISSING!'}`);
  console.log(`[DB] Target database: ${process.env.MONGODB_DB || 'oac_test'}`);
  
  if (!MONGODB_URI) {
    console.error('[DB] ERROR: MONGODB_URI environment variable is not defined!');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  
  if (cached.conn) {
    console.log(`[DB] Using cached connection (${Date.now() - startTime}ms)`);
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[DB] Creating new connection...');
    const opts = {
      dbName: process.env.MONGODB_DB || 'oac_test',
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`[DB] Connection successful! (${Date.now() - startTime}ms)`);
      console.log(`[DB] Connected to: ${mongoose.connection.host}:${mongoose.connection.port}`);
      return mongoose;
    });
  } else {
    console.log('[DB] Waiting for existing connection promise...');
  }

  try {
    cached.conn = await cached.promise;
    console.log(`[DB] Ready state: ${cached.conn.connection.readyState} (${Date.now() - startTime}ms)`);
  } catch (e) {
    cached.promise = null;
    console.error(`[DB] Connection FAILED after ${Date.now() - startTime}ms`);
    console.error('[DB] Error:', e instanceof Error ? e.message : e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
