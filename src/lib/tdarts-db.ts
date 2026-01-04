import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const TDARTS_DB_NAME = process.env.TDARTS_DB_NAME || 'tdarts_v2'; // Default based on user feedback

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Secondary connection specifically for tDarts database access.
 * Models accessing tDarts data must be registered on this connection.
 */
let tdartsDb: mongoose.Connection;

declare global {
  var tdartsConn: mongoose.Connection | undefined;
}

if (process.env.NODE_ENV === 'production') {
  tdartsDb = mongoose.createConnection(MONGODB_URI, {
    dbName: TDARTS_DB_NAME,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
} else {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  if (!global.tdartsConn) {
    global.tdartsConn = mongoose.createConnection(MONGODB_URI, {
      dbName: TDARTS_DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
  tdartsDb = global.tdartsConn;
}

// Listeners (only attach once if possible, but hard to track in global ref. Mongoose handles it okay)
// We can check readyState
if (tdartsDb.readyState === 0) {
    // It's connecting...
}

tdartsDb.on('connected', () => {
  // console.log(`[tDarts DB] Connected to ${TDARTS_DB_NAME}`);
});

tdartsDb.on('error', (err) => {
  console.error(`[tDarts DB] Connection error:`, err);
});

export { tdartsDb };
